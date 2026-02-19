use crate::daemon::Daemon;
use crate::error::{Error, Result};
use crate::ipc::IpcConnection;
use crate::protocol::{Action, Command};
use clap::{Parser, Subcommand};
use std::net::{IpAddr, Ipv4Addr, SocketAddr};
use std::process::Stdio;
use tokio::net::TcpStream;
use tokio::time::{sleep, Duration};

#[derive(Parser, Debug)]
#[command(name = "computer-use")]
#[command(about = "Cross-platform computer automation CLI for AI agents", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,

    /// Session name for isolation
    #[arg(short, long, global = true)]
    session: Option<String>,

    /// Output JSON
    #[arg(short, long, global = true)]
    json: bool,

    /// Connect to daemon port (defaults to session-derived port)
    #[arg(long, global = true)]
    port: Option<u16>,

    /// Start daemon if not running
    #[arg(long, global = true, default_value_t = true)]
    start_daemon: bool,
}

fn parse_hwnd(raw: &str) -> std::result::Result<u64, String> {
    let s = raw.trim();
    if s.is_empty() {
        return Err("Empty hwnd".to_string());
    }

    if let Some(hex) = s.strip_prefix("0x").or_else(|| s.strip_prefix("0X")) {
        return u64::from_str_radix(hex, 16).map_err(|_| format!("Invalid hwnd: {}", raw));
    }

    s.parse::<u64>().map_err(|_| format!("Invalid hwnd: {}", raw))
}

#[derive(Subcommand, Debug)]
enum Commands {
    /// Take a snapshot of the desktop
    Snapshot {
        /// Save the snapshot in memory for later diffing
        #[arg(long)]
        save: bool,
    },

    /// Compare the current UI state with a previously saved snapshot
    Diff,

    /// Set the clipboard text
    SetClipboard { text: String },

    /// Get the clipboard text
    GetClipboard,

    /// Handle a file dialog (open/save)
    HandleFileDialog {
        /// The full path to the file to be selected or saved
        path: String,
    },

    /// Launch an application
    Launch {
        /// The name or path of the application to launch
        path: String,
    },

    /// Kill a process
    Kill {
        /// The name or PID of the process to kill
        target: String,
    },

    /// Start recording the screen
    StartRecording {
        /// Path to save the video file (e.g., recording.mp4)
        path: String,
    },

    /// Stop recording and save the video
    StopRecording,

    /// List available screens (derived from snapshot)
    ListScreens,

    /// List running processes
    ListProcesses,

    /// List top-level windows (Windows only for now)
    ListWindows,

    /// Focus a window by hwnd or selector (Windows only for now)
    FocusWindow {
        /// Target hwnd in decimal/hex (e.g. 0x00123456) OR selector (e.g. process:chrome, title:Notepad)
        target: String,
    },

    /// Print UI Automation tree (Windows only, requires --features uia)
    #[cfg(feature = "uia")]
    UiTree {
        /// Max depth to traverse from focused element
        #[arg(long, default_value_t = 3)]
        depth: u32,

        /// Max nodes to emit
        #[arg(long, default_value_t = 200)]
        limit: u32,
    },

    /// Take a screenshot (returns base64 png unless --path is provided)
    /// Search for an image on screen
    /// Read text from the screen (OCR)
    Ocr {
        /// X coordinate of the top-left corner of the region
        #[arg(long)]
        x: Option<i32>,
        /// Y coordinate of the top-left corner of the region
        #[arg(long)]
        y: Option<i32>,
        /// Width of the region
        #[arg(long)]
        width: Option<u32>,
        /// Height of the region
        #[arg(long)]
        height: Option<u32>,
    },

    /// Search for an image on screen
    VisualSearch {
        /// Path to the template image to search for
        image_path: String,
    },

    /// Take a screenshot (returns base64 png unless --path is provided)
    Screenshot {
        /// Screen index (from snapshot), default 0
        #[arg(long)]
        screen: Option<u32>,
        /// Save to file path (if provided, response contains path)
        #[arg(long)]
        path: Option<String>,
    },

    /// Move mouse to absolute coordinates
    Move { x: i32, y: i32 },

    /// Click at (x,y) or click by ref like @e1
    Click {
        /// Selector ref like @e1
        target: Option<String>,
        /// Absolute X
        x: Option<i32>,
        /// Absolute Y
        y: Option<i32>,
    },

    /// Type text
    Type { text: String },

    /// Press a key (enter/tab/esc)
    Press { key: String },

    /// Swipe from (x1, y1) to (x2, y2)
    Swipe {
        x1: i32,
        y1: i32,
        x2: i32,
        y2: i32,
    },

    /// View command history
    History,

    /// Clear command history
    HistoryClear,

    /// Replay commands from history
    /// Wait for an element to appear on screen
    WaitForElement {
        /// Selector for the element (e.g., "title:Notepad")
        selector: String,

        /// Timeout in seconds
        #[arg(long, default_value_t = 10)]
        timeout: u64,
    },

    /// Replay commands from history
    Replay {
        /// Number of recent commands to replay
        #[arg(long, default_value_t = 1)]
        last: usize,
    },

    /// Run daemon in foreground
    Daemon,
}

pub async fn run() -> Result<()> {
    let cli = Cli::parse();
    let session = cli.session.unwrap_or_else(|| "default".to_string());

    let port = cli.port.unwrap_or_else(|| session_to_port(&session));
    let addr = SocketAddr::new(IpAddr::V4(Ipv4Addr::LOCALHOST), port);

    match cli.command {
        Commands::Daemon => {
            let daemon = Daemon::new(addr).await?;
            return daemon.run().await;
        }
        _ => {}
    }


    let mut conn = connect(addr).await.or_else(|e| {
        if cli.start_daemon {
            start_daemon(&session, port).await?;
            connect_with_retry(addr, 10, Duration::from_millis(200)).await
        } else {
            Err(e)
        }
    })?;

    let (action, params) = prepare_command(&cli.command)?;

    let cmd = Command::new(action, params);
    conn.send_command(&cmd).await?;
    let resp = conn.receive_response().await?;

    handle_response(resp, &cli)?;

    Ok(())
}

fn session_to_port(session: &str) -> u16 {
    // Stable, deterministic port per session. Keep in high ephemeral range.
    let mut hash: u32 = 2166136261;
    for b in session.as_bytes() {
        hash ^= *b as u32;
        hash = hash.wrapping_mul(16777619);
    }
    40000 + (hash % 20000) as u16
}

async fn connect(addr: SocketAddr) -> Result<IpcConnection> {
    let stream = TcpStream::connect(addr)
        .await
        .map_err(|e| Error::Ipc(e.to_string()))?;
    Ok(IpcConnection::new(stream))
}

async fn connect_with_retry(addr: SocketAddr, attempts: usize, delay: Duration) -> Result<IpcConnection> {
    let mut last_err: Option<Error> = None;
    for _ in 0..attempts {
        match connect(addr).await {
            Ok(conn) => return Ok(conn),
            Err(e) => {
                last_err = Some(e);
                sleep(delay).await;
            }
        }
    }
    Err(last_err.unwrap_or_else(|| Error::DaemonNotRunning))
}

/// Prepares a command by converting CLI command enum into Action and parameters.
///
/// This function acts as a bridge between the CLI interface and the internal protocol.
/// It parses the high-level CLI commands and converts them into the corresponding
/// Action enum with the appropriate JSON parameters.
///
/// # Arguments
/// * `command` - The CLI command enum variant to convert
///
/// # Returns
/// Returns a tuple containing:
/// - The Action enum representing the operation to perform
/// - A JSON value containing the parameters for the action
///
/// # Errors
/// Returns an error if:
/// - Required parameters are missing (e.g., x/y coordinates for Move action)
/// - Invalid parameter combinations are provided (e.g., neither target nor coordinates for Click)
fn prepare_command(command: &Commands) -> Result<(Action, serde_json::Value)> {
    let (action, params) = match command {
        Commands::Snapshot { save } => (Action::Snapshot, serde_json::json!({ "save": save })),
        Commands::Diff => (Action::Diff, serde_json::json!({})),
        Commands::SetClipboard { text } => (Action::SetClipboard, serde_json::json!({ "text": text })),
        Commands::GetClipboard => (Action::GetClipboard, serde_json::json!({})),
        Commands::HandleFileDialog { path } => (Action::HandleFileDialog, serde_json::json!({ "path": path })),
        Commands::Launch { path } => (Action::Launch, serde_json::json!({ "path": path })),
        Commands::Kill { target } => (Action::Kill, serde_json::json!({ "target": target })),
        Commands::StartRecording { path } => (Action::StartRecording, serde_json::json!({ "path": path })),
        Commands::StopRecording => (Action::StopRecording, serde_json::json!({})),
        Commands::ListScreens => (Action::Snapshot, serde_json::json!({})),
        Commands::ListProcesses => (Action::ListProcesses, serde_json::json!({})),
        Commands::ListWindows => (Action::ListWindows, serde_json::json!({})),
        Commands::FocusWindow { target } => match parse_hwnd(target) {
            Ok(hwnd) => (Action::FocusWindow, serde_json::json!({"hwnd": hwnd})),
            Err(_) => (Action::FocusWindow, serde_json::json!({"selector": target})),
        },
        Commands::Ocr { x, y, width, height } => (
            Action::Ocr,
            serde_json::json!({ "x": x, "y": y, "width": width, "height": height }),
        ),
        Commands::VisualSearch { image_path } => (
            Action::VisualSearch,
            serde_json::json!({ "image_path": image_path }),
        ),
        #[cfg(feature = "uia")]
        Commands::UiTree { depth, limit } => (
            Action::UiTree,
            serde_json::json!({"depth": depth, "limit": limit}),
        ),
        Commands::Screenshot { screen, path } => (
            Action::Screenshot,
            serde_json::json!({ "screen": screen, "path": path }),
        ),
        Commands::Move { x, y } => (Action::Move, serde_json::json!({"x": x, "y": y})),
        Commands::Click { target, x, y } => {
            if let Some(t) = target {
                (Action::Click, serde_json::json!({ "selector": t }))
            } else if let (Some(x), Some(y)) = (x, y) {
                (Action::Click, serde_json::json!({ "x": x, "y": y }))
            } else {
                return Err(Error::InvalidCommand(
                    "click requires either <target> (@eN) or <x> <y>".to_string(),
                ));
            }
        }
        Commands::Type { text } => (Action::Type, serde_json::json!({"text": text})),
        Commands::Press { key } => (Action::Press, serde_json::json!({"key": key})),
        Commands::Swipe { x1, y1, x2, y2 } => (
            Action::Swipe,
            serde_json::json!({ "x1": x1, "y1": y1, "x2": x2, "y2": y2 }),
        ),
        Commands::History => (Action::History, serde_json::json!({})),
        Commands::HistoryClear => (Action::HistoryClear, serde_json::json!({})),
        Commands::WaitForElement { selector, timeout } => (
            Action::WaitForElement,
            serde_json::json!({ "selector": selector, "timeout": timeout }),
        ),
        Commands::Replay { last } => (Action::Replay, serde_json::json!({ "last": last })),
        Commands::Daemon => unreachable!(),
    };
    Ok((action, params))
}

/// Handles and displays the response from the daemon.
///
/// This function processes the response received from the daemon and formats it
/// for display to the user. It supports both JSON output mode and human-readable
/// formatted output for various command types.
///
/// # Arguments
/// * `resp` - The Response object received from the daemon
/// * `cli` - The CLI configuration containing output format preferences
///
/// # Returns
/// Returns Ok(()) if the response was handled successfully
///
/// # Errors
/// Propagates any errors that occur during response processing or JSON serialization
///
/// # Output Formats
/// - JSON mode: Outputs the raw response as JSON
/// - Human-readable mode: Formats output based on command type:
///   - Snapshot/ListScreens: Displays UI elements or screen information
///   - ListProcesses: Shows process ID and name pairs
///   - ListWindows: Shows window handle, PID, and title
///   - Other commands: Pretty-prints JSON data
fn handle_response(resp: crate::protocol::Response, cli: &Cli) -> Result<()> {
    if cli.json {
        println!("{}", serde_json::to_string(&resp).map_err(|e| Error::Protocol(e.to_string()))?);
        return Ok(());
    }

    if !resp.success {
        eprintln!("✗ {}", resp.error.unwrap_or_else(|| "Unknown error".to_string()));
        return Ok(());
    }

    if let Some(data) = resp.data {
        let is_snapshot = matches!(cli.command, Commands::Snapshot);
        let is_list_screens = matches!(cli.command, Commands::ListScreens);
        let is_list_processes = matches!(cli.command, Commands::ListProcesses);
        let is_list_windows = matches!(cli.command, Commands::ListWindows);
        #[cfg(feature = "uia")]
        let is_ui_tree = matches!(cli.command, Commands::UiTree { .. });

        #[cfg(not(feature = "uia"))]
        let is_ui_tree = false;

        if is_snapshot || is_list_screens {
            let snap: crate::protocol::Snapshot = serde_json::from_value(data)
                .map_err(|e| Error::Protocol(e.to_string()))?;

            if is_list_screens {
                for s in snap.screens {
                    let primary = if s.is_primary { " (primary)" } else { "" };
                    println!(
                        "- screen:{}{} [x={},y={},w={},h={}]",
                        s.index, primary, s.x, s.y, s.width, s.height
                    );
                }
            } else {
                for node in snap.nodes {
                    let extra = node
                        .attributes
                        .as_ref()
                        .and_then(|v| {
                            let x = v.get("x")?.as_i64()?;
                            let y = v.get("y")?.as_i64()?;
                            let w = v.get("width")?.as_u64()?;
                            let h = v.get("height")?.as_u64()?;
                            Some(format!(" [x={},y={},w={},h={}]", x, y, w, h))
                        })
                        .unwrap_or_default();

                    match node.name {
                        Some(name) => println!("- {} \"{}\" [ref={}]{}", node.role, name, node.ref_id, extra),
                        None => println!("- {} [ref={}]{}", node.role, node.ref_id, extra),
                    }
                }
            }
        } else {
            if is_list_processes {
                let arr = data.as_array().cloned().unwrap_or_default();
                for p in arr {
                    let pid = p.get("pid").and_then(|v| v.as_u64()).unwrap_or(0);
                    let name = p.get("name").and_then(|v| v.as_str()).unwrap_or("");
                    println!("- {} {}", pid, name);
                }
            } else if is_list_windows {
                let arr = data.as_array().cloned().unwrap_or_default();
                for w in arr {
                    let hwnd = w.get("hwnd").and_then(|v| v.as_u64()).unwrap_or(0);
                    let pid = w.get("pid").and_then(|v| v.as_u64()).unwrap_or(0);
                    let title = w.get("title").and_then(|v| v.as_str()).unwrap_or("");
                    println!("- hwnd=0x{:X} pid={} {}", hwnd, pid, title);
                }
            } else if is_ui_tree {
                println!(
                    "{}",
                    serde_json::to_string_pretty(&data).unwrap_or_else(|_| "{}".to_string())
                );
            } else {
                println!(
                    "{}",
                    serde_json::to_string_pretty(&data).unwrap_or_else(|_| "{}".to_string())
                );
            }
        }
    } else {
        println!("✓ Done");
    }
    Ok(())
}

async fn start_daemon(session: &str, port: u16) -> Result<()> {
    let exe = std::env::current_exe().map_err(|e| Error::Io(e))?;
    let mut cmd = std::process::Command::new(exe);
    cmd.arg("--session")
        .arg(session)
        .arg("--port")
        .arg(port.to_string())
        .arg("daemon")
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null());

    cmd.spawn().map_err(|e| Error::Ipc(e.to_string()))?;
    Ok(())
}
