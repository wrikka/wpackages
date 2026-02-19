use crate::error::{Error, Result};
use crate::ipc::IpcConnection;
use crate::protocol::{self, Action, Command, Context, Params};
use crate::protocol::params::*;
use clap::{Parser, Subcommand};
use clap_verbosity_flag::Verbosity;
use rustyline::error::ReadlineError;
use rustyline::DefaultEditor;
use shlex;

const DEFAULT_ADDR: &str = "127.0.0.1:8080";
const DEFAULT_SESSION: &str = "default";

#[derive(Parser, Debug)]
#[command(name = "browser-use")]
#[command(about = "Headless browser automation CLI for AI agents", long_about = None)]
pub struct Cli {
    #[command(subcommand)]
    command: Commands,

    #[command(flatten)]
    pub verbose: Verbosity,

    /// Session name for isolation
    #[arg(short, long, global = true)]
    session: Option<String>,

    /// Run with a visible browser window (default: headless)
    #[arg(long, global = true)]
    headed: bool,

    /// IPC address for daemon
    #[arg(short, long, global = true)]
    addr: Option<String>,

    /// Output JSON
    #[arg(short, long, global = true)]
    json: bool,

    /// Path to user data directory for session persistence
    #[arg(long, global = true)]
    datadir: Option<String>,

    /// Enable stealth mode to bypass bot detection
    #[arg(long, global = true)]
    stealth: bool,

    /// Address for metrics server
    #[arg(long, global = true)]
    metrics_addr: Option<String>,
}

#[derive(Subcommand, Debug)]
enum Commands {
    Open { url: String },
    Click { selector: String },
    Type { selector: String, text: String },
    TypeSecret { selector: String, text: String },
    Fill { selector: String, value: String },
    GetText { selector: String },
    GetHtml { selector: String },
    GetValue { selector: String },
    GetAttr { selector: String, name: String },
    GetCount { selector: String },
    ExtractTable { selector: String },
    GetTitle,
    GetUrl,
    IsVisible { selector: String },
    IsEnabled { selector: String },
    IsChecked { selector: String },
    /// Take a snapshot of the page
    Snapshot,
    /// Diff the current page against the last snapshot
    DiffSnapshot,

    /// Get a visual analysis of the page (placeholder)
    VisualSnapshot,

    /// Summarize the page content (placeholder)
    Summarize,

    /// Find an element by natural language query
    Find { query: String },

    /// Get the action history for the session
    History,

    /// Wait for a condition to be met
    WaitFor {
        /// Element selector to wait for
        #[arg(short, long)]
        element: String,
        /// Timeout in milliseconds
        #[arg(short, long)]
        timeout: Option<u64>,
    },
    ExecuteJs { script: String },
    Screenshot { #[arg(short, long)] path: Option<String> },
    Back,
    Forward,
    Interactive,
    Reload,
    Hover { selector: String },
    Scroll { selector: String },
    Check { selector: String },
    Uncheck { selector: String },
    Upload { selector: String, path: String },
    /// Get network requests
    Network,

    /// Get a HAR log of network activity
    Har,

    /// Get logged WebSocket frames
    Websockets,

    /// Fill a form from a JSON string
    AutomatedFill {
        /// JSON string of fields to fill, e.g., '[{"selector":"#name","value":"John"}]'
        json_data: String,
    },

    /// Set the geolocation of the browser
    SetGeolocation {
        #[arg(long)] latitude: f64,
        #[arg(long)] longitude: f64,
        #[arg(long)] accuracy: Option<f64>,
    },

    /// Manage browser cookies
    #[command(subcommand)]
    Cookies(CookieCommands),
    Status,
    Tabs,
    NewTab,
    SwitchTab { index: usize },
    CloseTab { index: usize },
    Daemon,
}

#[derive(Subcommand, Debug)]
pub enum CookieCommands {
    /// Get all cookies
    Get,
    /// Add a cookie
    Add {
        #[arg(long)] name: String,
        #[arg(long)] value: String,
        #[arg(long)] url: Option<String>,
        #[arg(long)] domain: Option<String>,
        #[arg(long)] path: Option<String>,
        #[arg(long)] secure: Option<bool>,
        #[arg(long)] http_only: Option<bool>,
        #[arg(long)] same_site: Option<String>,
        #[arg(long)] expires: Option<f64>,
    },
    /// Delete a cookie
    Delete {
        #[arg(long)] name: String,
        #[arg(long)] url: String,
    },
}

pub async fn run(cli: Cli) -> Result<()> {
    let addr = cli.addr.clone().unwrap_or_else(|| DEFAULT_ADDR.to_string());
    let metrics_addr = cli.metrics_addr.clone();

    match cli.command {
        Commands::Daemon => {
            let daemon = crate::daemon::Daemon::new(addr, metrics_addr).await?;
            daemon.run().await
        }
        Commands::Interactive => run_interactive_session(cli).await.map_err(Into::into),
        _ => {
            let (action, params) = convert_command_to_action_params(&cli.command, &cli);
            let context = Context {
                session: cli.session.unwrap_or_else(|| DEFAULT_SESSION.to_string()),
                headless: !cli.headed,
                datadir: cli.datadir,
                stealth: cli.stealth,
            };
            send_command(addr, action, params, context, cli.json).await
        }
    }
}

async fn send_command(addr: String, action: Action, params: Params, context: Context, json_output: bool) -> Result<()> {
    let mut connection = IpcConnection::connect(&addr).await.map_err(|e| Error::DaemonNotRunning(e.to_string()))?;
    let command = Command::new(action, params, context);
    connection.send_command(&command).await?;
    let response = connection.receive_response().await?;

    if response.success {
        if json_output {
            println!("{}", serde_json::to_string_pretty(&response)?);
        } else if let Some(data) = response.data {
            if let Ok(snapshot) = serde_json::from_value::<protocol::Snapshot>(data.clone()) {
                println!("Snapshot for {}:", snapshot.url);
                for node in snapshot.nodes {
                    println!("- {} '{}' [ref={}]", node.role, node.name.unwrap_or_default(), node.ref_id);
                }
            } else {
                println!("{}", serde_json::to_string_pretty(&data)?);
            }
        }
    } else {
        let err_msg = response.error.unwrap_or_else(|| "Unknown error".to_string());
        return Err(Error::Daemon(err_msg));
    }
    Ok(())
}

async fn run_interactive_session(cli: Cli) -> anyhow::Result<()> {
    let mut rl = DefaultEditor::new()?;
    let addr = cli.addr.unwrap_or_else(|| DEFAULT_ADDR.to_string());
    let mut session = cli.session.unwrap_or_else(|| DEFAULT_SESSION.to_string());

    println!("Starting interactive session for session '{}'. Type 'exit' or press Ctrl-D to quit.", session);

    loop {
        let readline = rl.readline(&format!("browser-use ({})>> ", session));
        match readline {
            Ok(line) => {
                if line.trim().is_empty() { continue; }
                rl.add_history_entry(line.as_str())?;
                if line.trim().to_lowercase() == "exit" { break; }

                let args = shlex::split(&line).unwrap_or_default();
                let full_args = std::iter::once("browser-use".to_string()).chain(args.into_iter());

                match Cli::try_parse_from(full_args) {
                    Ok(mut interactive_cli) => {
                        interactive_cli.session = Some(session.clone());
                        let (action, params) = convert_command_to_action_params(&interactive_cli.command, &interactive_cli);
                        let context = Context {
                            session: interactive_cli.session.unwrap(),
                            headless: !interactive_cli.headed,
                            datadir: interactive_cli.datadir.clone(),
                            stealth: interactive_cli.stealth,
                        };
                        if let Err(e) = send_command(addr.clone(), action, params, context, interactive_cli.json).await {
                            eprintln!("Error: {}", e);
                        }
                    }
                    Err(e) => e.print()?,
                }
            }
            Err(ReadlineError::Interrupted) => println!("Interrupted. Type 'exit' or press Ctrl-D to quit."),
            Err(ReadlineError::Eof) => break,
            Err(err) => {
                eprintln!("Error: {:?}", err);
                break;
            }
        }
    }
    Ok(())
}

fn convert_command_to_action_params(command: &Commands, cli: &Cli) -> (Action, Params) {
    match command {
        Commands::Open { url } => (Action::Open, Params::Open(OpenParams { url: url.clone() })),
        Commands::Click { selector } => (Action::Click, Params::Click(ClickParams { selector: selector.clone() })),
        Commands::Type { selector, text } => (Action::Type, Params::Type(TypeParams { selector: selector.clone(), text: text.clone() })),
        Commands::TypeSecret { selector, text } => (Action::TypeSecret, Params::TypeSecret(TypeParams { selector: selector.clone(), text: text.clone() })),
        Commands::Fill { selector, value } => (Action::Fill, Params::Fill(FillParams { selector: selector.clone(), value: value.clone() })),
        Commands::GetText { selector } => (Action::GetText, Params::GetText(GetTextParams { selector: selector.clone() })),
        Commands::GetHtml { selector } => (Action::GetHtml, Params::GetHtml(GetHtmlParams { selector: selector.clone() })),
        Commands::GetValue { selector } => (Action::GetValue, Params::GetValue(GetValueParams { selector: selector.clone() })),
        Commands::GetAttr { selector, name } => (Action::GetAttr, Params::GetAttr(GetAttrParams { selector: selector.clone(), name: name.clone() })),
        Commands::GetCount { selector } => (Action::GetCount, Params::GetCount(GetCountParams { selector: selector.clone() })),
        Commands::ExtractTable { selector } => (Action::ExtractTable, Params::ExtractTable(ExtractTableParams { selector: selector.clone() })),
        Commands::GetTitle => (Action::GetTitle, Params::Empty),
        Commands::GetUrl => (Action::GetUrl, Params::Empty),
        Commands::IsVisible { selector } => (Action::IsVisible, Params::IsVisible(IsVisibleParams { selector: selector.clone() })),
        Commands::IsEnabled { selector } => (Action::IsEnabled, Params::IsEnabled(IsEnabledParams { selector: selector.clone() })),
        Commands::IsChecked { selector } => (Action::IsChecked, Params::IsChecked(IsCheckedParams { selector: selector.clone() })),
        Commands::Snapshot => (Action::Snapshot, Params::Empty),
        Commands::DiffSnapshot => (Action::DiffSnapshot, Params::Empty),
        Commands::VisualSnapshot => (Action::VisualSnapshot, Params::Empty),
        Commands::Summarize => (Action::SummarizePage, Params::Empty),
        Commands::Find { query } => (Action::FindElement, Params::FindElement(protocol::element_finder::ElementFinderRequest { query: query.clone() })),
        Commands::History => (Action::GetHistory, Params::Empty),
        Commands::WaitFor { element, timeout } => (
            Action::WaitFor,
            Params::WaitFor(protocol::waits::WaitRequest {
                condition: protocol::waits::WaitCondition::Element { selector: element.clone() },
                timeout_ms: *timeout,
            }),
        ),
        Commands::ExecuteJs { script } => (Action::ExecuteJs, Params::ExecuteJs(protocol::js_executor::ExecuteJsRequest {
            session_id: cli.session.clone(),
            script: script.clone(),
        })),
        Commands::Screenshot { path } => (Action::Screenshot, Params::Screenshot(ScreenshotParams { path: path.clone() })),
        Commands::Back => (Action::Back, Params::Empty),
        Commands::Forward => (Action::Forward, Params::Empty),
        Commands::Reload => (Action::Reload, Params::Empty),
        Commands::Hover { selector } => (Action::Hover, Params::Hover(HoverParams { selector: selector.clone() })),
        Commands::Scroll { selector } => (Action::Scroll, Params::Scroll(ScrollParams { selector: selector.clone() })),
        Commands::Check { selector } => (Action::Check, Params::Check(CheckParams { selector: selector.clone() })),
        Commands::Uncheck { selector } => (Action::Uncheck, Params::Uncheck(UncheckParams { selector: selector.clone() })),
        Commands::Upload { selector, path } => (Action::Upload, Params::Upload(UploadParams { selector: selector.clone(), path: path.clone() })),
        Commands::Console => (Action::Console, Params::Empty),
        Commands::Network => (Action::Network, Params::Empty),
        Commands::Har => (Action::GetHar, Params::Empty),
        Commands::Websockets => (Action::GetWebSocketFrames, Params::Empty),
        Commands::AutomatedFill { json_data } => {
            let fields: Vec<protocol::forms::FormField> = serde_json::from_str(json_data).unwrap_or_default();
            (
                Action::AutomatedFill,
                Params::AutomatedFill(protocol::forms::AutomatedFormFillRequest { fields })
            )
        },
        Commands::SetGeolocation { latitude, longitude, accuracy } => (
            Action::SetGeolocation,
            Params::SetGeolocation(protocol::geolocation::SetGeolocationRequest { 
                latitude: *latitude, 
                longitude: *longitude, 
                accuracy: *accuracy 
            })
        ),
        Commands::Cookies(subcommand) => match subcommand {
            CookieCommands::Get => (Action::GetCookies, Params::Empty),
            CookieCommands::Add { name, value, url, domain, path, secure, http_only, same_site, expires } => (
                Action::AddCookie,
                Params::AddCookie(protocol::cookies::AddCookieRequest {
                    name: name.clone(),
                    value: value.clone(),
                    url: url.clone(),
                    domain: domain.clone(),
                    path: path.clone(),
                    secure: *secure,
                    http_only: *http_only,
                    same_site: same_site.clone(),
                    expires: *expires,
                })
            ),
            CookieCommands::Delete { name, url } => (
                Action::DeleteCookie,
                Params::DeleteCookie(protocol::cookies::DeleteCookieRequest { name: name.clone(), url: url.clone() })
            ),
        },
        Commands::Status => (Action::Status, Params::Empty),
        Commands::Tabs => (Action::Tabs, Params::Empty),
        Commands::NewTab => (Action::NewTab, Params::Empty),
        Commands::SwitchTab { index } => (Action::SwitchTab, Params::SwitchTab(SwitchTabParams { index: *index })),
        Commands::CloseTab { index } => (Action::CloseTab, Params::CloseTab(CloseTabParams { index: *index })),
        Commands::Daemon | Commands::Interactive => unreachable!(),
    }
}
