use crate::services::handlers;
use crate::error::{Error, Result};
use crate::ipc::IpcServer;
use crate::types::{BoundingBox, UIElement};
use crate::protocol::{Action, Command, Response};
use crate::selector;
use crate::snapshot::SnapshotBuilder;
use crate::uia;
use crate::vision;
use base64::Engine;
use enigo::{Enigo, Keyboard, Mouse, Settings};
use sysinfo::System;
use std::net::SocketAddr;
use std::sync::Arc;
use std::{io::Cursor};
use tokio::sync::{watch, Mutex};
use tokio::task::JoinHandle;
use tracing::{error, info};

#[cfg(windows)]
use windows::Win32::Foundation::{HWND, LPARAM};

#[cfg(windows)]
use windows::Win32::UI::WindowsAndMessaging::{
    EnumWindows, GetWindowTextLengthW, GetWindowTextW, GetWindowThreadProcessId, IsWindowVisible,
    SetForegroundWindow,
};

#[cfg(windows)]
#[derive(Debug, Clone)]
pub struct WindowInfo {
    hwnd: u64,
    pid: u32,
    title: String,
}

#[cfg(windows)]
pub fn enumerate_windows() -> Result<Vec<WindowInfo>> {
    unsafe extern "system" fn enum_cb(hwnd: HWND, lparam: LPARAM) -> i32 {
        // SAFETY: caller passes valid pointer
        let out = unsafe { &mut *(lparam.0 as *mut Vec<WindowInfo>) };

        if unsafe { IsWindowVisible(hwnd) }.as_bool() == false {
            return 1;
        }

        let len = unsafe { GetWindowTextLengthW(hwnd) };
        if len <= 0 {
            return 1;
        }

        let mut buf = vec![0u16; (len as usize) + 1];
        let copied = unsafe { GetWindowTextW(hwnd, &mut buf) };
        if copied <= 0 {
            return 1;
        }

        let title = String::from_utf16_lossy(&buf[..copied as usize]).trim().to_string();
        if title.is_empty() {
            return 1;
        }

        let mut pid: u32 = 0;
        unsafe {
            GetWindowThreadProcessId(hwnd, Some(&mut pid));
        }

        out.push(WindowInfo {
            hwnd: hwnd.0 as u64,
            pid,
            title,
        });

        1
    }

    let mut windows: Vec<WindowInfo> = Vec::new();
    let lparam = LPARAM((&mut windows as *mut Vec<WindowInfo>) as isize);
    unsafe { EnumWindows(Some(enum_cb), lparam) }
        .map_err(|e| Error::Computer(format!("EnumWindows failed: {e}")))?;

    Ok(windows)
}

pub struct Daemon {
    server: IpcServer,
    enigo: Arc<Mutex<Enigo>>,
    addr: SocketAddr,
}

impl Daemon {
    pub async fn new(addr: SocketAddr) -> Result<Self> {
        let server = IpcServer::bind(&addr.to_string()).await?;
        let enigo = Enigo::new(&Settings::default()).map_err(|e| Error::Computer(e.to_string()))?;

        Ok(Self {
            server,
            enigo: Arc::new(Mutex::new(enigo)),
            addr,
        })
    }

    pub async fn run(&self) -> Result<()> {
        info!("Daemon started on {}", self.addr);

        loop {
            let mut conn = self.server.accept().await?;
            let enigo = self.enigo.clone();
            let snapshot_builder = SnapshotBuilder::new();
            let mut history: Vec<Command> = Vec::new();
            let mut saved_snapshot: Option<crate::protocol::Snapshot> = None;

            tokio::spawn(async move {
                loop {
                    match conn.receive_command().await {
                        Ok(command) => {
                            let id = command.id.clone();
                            let resp = match execute_command(command, &snapshot_builder, &enigo, &mut history, &mut saved_snapshot).await {
                                Ok(data) => Response::success(id, data),
                                Err(e) => Response::error(id, e.to_string()),
                            };
                            if let Err(e) = conn.send_response(&resp).await {
                                error!("Error sending response: {}", e);
                                break;
                            }
                        }
                        Err(e) => {
                            error!("Error receiving command: {}", e);
                            break;
                        }
                    }
                }
            });
        }
    }
}

pub fn list_windows_impl() -> Result<Option<serde_json::Value>> {
    #[cfg(windows)]
    {
        let windows = enumerate_windows()?;

        let arr = windows
            .into_iter()
            .map(|w| serde_json::json!({ "hwnd": w.hwnd, "pid": w.pid, "title": w.title }))
            .collect::<Vec<_>>();

        return Ok(Some(serde_json::Value::Array(arr)));
    }

    #[cfg(not(windows))]
    {
        Err(Error::InvalidCommand(
            "ListWindows is only supported on Windows for now".to_string(),
        ))
    }
}

pub fn focus_window_impl(params: &serde_json::Value) -> Result<Option<serde_json::Value>> {
    #[cfg(windows)]
    {
        let hwnd_u64 = match params.get("hwnd").and_then(|v| v.as_u64()) {
            Some(h) => Ok(h),
            None => {
                let selector_str = params
                    .get("selector")
                    .and_then(|v| v.as_str())
                    .ok_or_else(|| Error::InvalidCommand("Missing hwnd/selector".to_string()))?;

                find_window_by_selector(selector_str).map(|w| w.hwnd)
            }
        }?;

        let hwnd = HWND(hwnd_u64 as isize);
        if unsafe { SetForegroundWindow(hwnd) }.as_bool() == false {
            return Err(Error::Computer(format!(
                "SetForegroundWindow failed for hwnd=0x{:X}",
                hwnd_u64
            )));
        }

        let mut win_info = WindowInfo {
            hwnd: hwnd_u64,
            pid: 0,
            title: String::new(),
        };

        if let Ok(windows) = enumerate_windows() {
            if let Some(found) = windows.into_iter().find(|x| x.hwnd == hwnd_u64) {
                win_info = found;
            }
        }

        return Ok(Some(serde_json::json!({
            "hwnd": win_info.hwnd,
            "focused": true,
            "pid": win_info.pid,
            "title": win_info.title,
        })));
    }

    #[cfg(not(windows))]
    {
        let _ = params;
        Err(Error::InvalidCommand(
            "FocusWindow is only supported on Windows for now".to_string(),
        ))
    }
}

#[cfg(windows)]
pub fn find_window_by_selector(selector_str: &str) -> Result<WindowInfo> {
    let windows = enumerate_windows()?;
    let mut sys = System::new_all();
    sys.refresh_processes();
    find_best_window_match(selector_str, windows, &sys)
}

/// Finds the best matching window based on a selector string.
///
/// This function implements a scoring algorithm to match windows based on various criteria:
/// - PID (Process ID) matching
/// - Window title matching (exact or partial)
/// - Process name matching (exact or partial)
///
/// The scoring system works as follows:
/// - Exact title match: +25 points
/// - Exact process name match: +25 points
/// - Partial title match: +10 points
/// - Partial process name match: +10 points
///
/// # Arguments
/// * `selector_str` - The selector string in format like "title:Notepad", "pid:1234", etc.
/// * `windows` - A vector of WindowInfo containing available windows
/// * `sys` - A System instance for process information
///
/// # Returns
/// Returns the WindowInfo with the highest score that matches the selector criteria.
///
/// # Errors
/// Returns an error if:
/// - The selector format is invalid
/// - No windows match the selector criteria
#[cfg(windows)]
fn find_best_window_match(selector_str: &str, windows: Vec<WindowInfo>, sys: &System) -> Result<WindowInfo> {
    let want_hwnd = selector::get_hwnd_from_selector(selector_str);
    let want_pid = selector::get_pid_from_selector(selector_str);
    let want_title_exact = selector::get_title_exact_from_selector(selector_str);
    let want_title = selector::get_title_from_selector(selector_str);
    let want_process_exact = selector::get_process_exact_from_selector(selector_str);
    let want_process = selector::get_process_from_selector(selector_str);

    if want_hwnd.is_none()
        && want_pid.is_none()
        && want_title_exact.is_none()
        && want_title.is_none()
        && want_process_exact.is_none()
        && want_process.is_none()
    {
        return Err(Error::InvalidCommand(
            "selector for focus-window must include one of: hwnd:/pid:/title:/title_exact:/process:/process_exact".to_string(),
        ));
    }

    if let Some(h) = want_hwnd {
        return Ok(WindowInfo {
            hwnd: h,
            pid: 0,
            title: String::new(),
        });
    }


    let mut best_match: Option<WindowInfo> = None;
    let mut best_score: i32 = -1;

    for w in windows {
        if let Some(pid_q) = want_pid {
            if w.pid != pid_q {
                continue;
            }
        }

        let mut score: i32 = 0;

        if let Some(ref title_q) = want_title_exact {
            if w.title == *title_q {
                score += 25;
            } else {
                continue;
            }
        } else if let Some(ref title_q) = want_title {
            let wt = w.title.to_lowercase();
            let q = title_q.to_lowercase();
            if wt == q {
                score += 20;
            } else if wt.contains(&q) {
                score += 10;
            } else {
                continue;
            }
        }

        if want_process_exact.is_some() || want_process.is_some() {
            if let Some(p) = sys.process(sysinfo::Pid::from_u32(w.pid)) {
                let pname = p.name();
                if let Some(ref proc_q) = want_process_exact {
                    if pname == *proc_q {
                        score += 25;
                    } else {
                        continue;
                    }
                } else if let Some(ref proc_q) = want_process {
                    let pn = pname.to_lowercase();
                    let q = proc_q.to_lowercase();
                    if pn == q {
                        score += 20;
                    } else if pn.contains(&q) {
                        score += 10;
                    } else {
                        continue;
                    }
                }
            } else {
                continue;
            }
        }

        if score > best_score {
            best_score = score;
            best_match = Some(w);
        }
    }

    best_match.ok_or_else(|| {
        Error::InvalidCommand("No window matched selector for focus-window".to_string())
    })
}

pub async fn execute_command(
    command: Command,
    snapshot_builder: &SnapshotBuilder,
    enigo: &Arc<Mutex<Enigo>>,
    history: &mut Vec<Command>,
    saved_snapshot: &mut Option<crate::protocol::Snapshot>,
    recording_handle: &mut Option<JoinHandle<()>>,
    stop_tx: watch::Sender<bool>,
) -> Result<Option<serde_json::Value>> {
    let should_record = !matches!(command.action, Action::History | Action::HistoryClear | Action::Replay);
    let command_to_record = if should_record { Some(command.clone()) } else { None };

    let result = match command.action {
        Action::Snapshot => handlers::snapshot::handle_snapshot(&command, snapshot_builder, saved_snapshot),
        Action::SetClipboard => handlers::clipboard::handle_set_clipboard(&command),
        Action::Launch => {
            let path = command.params["path"]
                .as_str()
                .ok_or_else(|| Error::InvalidCommand("Missing 'path' for launch".to_string()))?;

            std::process::Command::new(path)
                .spawn()
                .map_err(|e| Error::Computer(format!("Failed to launch '{}': {}", path, e)))?;

            Ok(Some(serde_json::json!({ "launched": path })))
        }
        Action::StartRecording => {
            if recording_handle.is_some() {
                return Err(Error::InvalidCommand("Recording is already in progress".to_string()));
            }
            let path_str = command.params["path"].as_str().ok_or_else(|| Error::InvalidCommand("Missing 'path' for start-recording".to_string()))?;
            let path = std::path::PathBuf::from(path_str);
            
            let (stop_tx_clone, stop_rx_clone) = watch::channel(false);
            *stop_tx = stop_tx_clone;

            let handle = tokio::spawn(crate::recording::recording_task(path.clone(), stop_rx_clone));
            *recording_handle = Some(handle);

            Ok(Some(serde_json::json!({ "status": "Recording started", "path": path })))
        }
        Action::StopRecording => {
            if recording_handle.take().is_some() {
                if stop_tx.send(true).is_err() {
                    return Err(Error::Computer("Failed to send stop signal to recording task".to_string()));
                }
                Ok(Some(serde_json::json!({ "status": "Recording stopped" })))
            } else {
                Err(Error::InvalidCommand("No recording in progress to stop".to_string()))
            }
        }
        Action::Kill => {
            let target = command.params["target"]
                .as_str()
                .ok_or_else(|| Error::InvalidCommand("Missing 'target' for kill".to_string()))?;

            let mut sys = System::new_all();
            sys.refresh_processes();

            let pid_to_kill: Option<sysinfo::Pid> = target.parse::<usize>().ok().map(sysinfo::Pid::from);

            let process_to_kill = sys.processes().iter().find(|(pid, process)| {
                if let Some(p) = pid_to_kill {
                    return *pid == &p;
                }
                process.name().eq_ignore_ascii_case(target)
            });

            if let Some((pid, process)) = process_to_kill {
                if process.kill() {
                    Ok(Some(serde_json::json!({ "killed": pid.as_u32() })))
                } else {
                    Err(Error::Computer(format!("Failed to kill process '{}'", target)))
                }
            } else {
                Err(Error::Computer(format!("Process '{}' not found", target)))
            }
        }
        Action::HandleFileDialog => handlers::file_dialog::handle_file_dialog(&command, enigo).await,
        Action::GetClipboard => {
            let mut clipboard = arboard::Clipboard::new().map_err(|e| Error::Computer(e.to_string()))?;
            let text = clipboard.get_text().map_err(|e| Error::Computer(e.to_string()))?;
            Ok(Some(serde_json::json!({ "text": text })))
        }
        Action::Diff => {
            let current_snapshot = snapshot_builder.snapshot()?;
            handlers::diff::handle_diff(&command, current_snapshot, saved_snapshot)
        }
        Action::ListProcesses => handlers::system::handle_list_processes(),
        Action::ListWindows => handlers::window::handle_list_windows(),
        Action::FocusWindow => handlers::window::handle_focus_window(&command),
        Action::UiTree => uia::ui_tree(&command.params),
        Action::Move => handlers::mouse::handle_move(&command, enigo).await,
        Action::Click => handlers::mouse::handle_click(&command, enigo).await,
        Action::ClickElement { element_id } => handlers::mouse::handle_click_element(&command, enigo, element_id).await,
        Action::Type => handlers::keyboard::handle_type(&command, enigo).await,
        Action::TypeText { element_id, text } => handlers::keyboard::handle_type_text(&command, enigo, element_id, text).await,
        Action::Wait { duration_ms } => {
            tokio::time::sleep(tokio::time::Duration::from_millis(duration_ms)).await;
            Ok(Some(serde_json::json!({ "waited_ms": duration_ms })))
        }
        Action::WaitDuration { duration } => {
            tokio::time::sleep(tokio::time::Duration::from_millis(*duration)).await;
            Ok(Some(serde_json::json!({ "waited_ms": duration })))
        }
        Action::Navigate { url } => {
            // Navigate to URL using browser automation
            handlers::browser::handle_navigate(&command, url).await
        }
        Action::Delete => handlers::keyboard::handle_delete(&command, enigo).await,
        Action::History => handlers::history::handle_history(history),
        Action::HistoryClear => handlers::history::handle_history_clear(history),
        Action::WaitForElement => handlers::window::handle_wait_for_element(&command).await,
        Action::Replay => handlers::history::handle_replay(&command, snapshot_builder, enigo, history, saved_snapshot).await,
        Action::Swipe => handlers::mouse::handle_swipe(&command, enigo).await,
        Action::Press => handlers::keyboard::handle_press(&command, enigo).await,
        Action::Ocr => handlers::vision::handle_ocr(&command),
        Action::VisualSearch => handlers::vision::handle_visual_search(&command),
        Action::Screenshot => handlers::vision::handle_screenshot(&command),
    };

    if result.is_ok() {
        if let Some(cmd) = command_to_record {
            history.push(cmd);
        }
    }

    result
}

fn resolve_selector_to_point(selector: &str) -> Result<(i32, i32)> {
    let sel = selector.trim();

    // Minimal selector: supports @eN and screen:<index> / screen:index=<index>
    if let Some(index) = selector::get_index_from_screen_selector(sel) {
        return resolve_screen_index_to_point(index);
    }

    if !sel.starts_with('@') {
        return Err(Error::InvalidSelector(format!("Unsupported selector: {}", selector)));
    }

    let id = sel.trim_start_matches('@');
    if !id.starts_with('e') {
        return Err(Error::InvalidSelector(format!("Unsupported ref: {}", selector)));
    }
    let n: usize = id
        .trim_start_matches('e')
        .parse()
        .map_err(|_| Error::InvalidSelector(format!("Invalid ref: {}", selector)))?;

    if n == 0 {
        return Err(Error::InvalidSelector(format!("Invalid ref: {}", selector)));
    }

    let screens = screenshots::Screen::all().map_err(|e| Error::Computer(e.to_string()))?;
    resolve_screens_indexed_center_point(&screens, n - 1)
}

fn resolve_screen_index_to_point(index: usize) -> Result<(i32, i32)> {
    let screens = screenshots::Screen::all().map_err(|e| Error::Computer(e.to_string()))?;
    resolve_screens_indexed_center_point(&screens, index)
}

fn resolve_screens_indexed_center_point(
    screens: &[screenshots::Screen],
    index: usize,
) -> Result<(i32, i32)> {
    let screen = screens
        .get(index)
        .ok_or_else(|| Error::InvalidSelector(format!("Invalid screen index: {}", index)))?;

    let di = &screen.display_info;
    let cx = di.x + (di.width as i32 / 2);
    let cy = di.y + (di.height as i32 / 2);
    Ok((cx, cy))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_find_best_window_match() {
        let windows = vec![
            WindowInfo { hwnd: 1, pid: 101, title: "Google Chrome".to_string() },
            WindowInfo { hwnd: 2, pid: 102, title: "Notepad".to_string() },
            WindowInfo { hwnd: 3, pid: 103, title: "Another Notepad Window".to_string() },
        ];
        let sys = System::new_all();

        // Test exact title match
        let result = find_best_window_match("title_exact:Notepad", windows.clone(), &sys).expect("Window not found");
        assert_eq!(result.hwnd, 2);

        // Test partial title match
        let result = find_best_window_match("title:notepad", windows.clone(), &sys).expect("Window not found");
        assert_eq!(result.hwnd, 2);

        // Test partial title match with multiple results (should pick highest score)
        let result = find_best_window_match("title:Notepad", windows.clone(), &sys).expect("Window not found");
        assert_eq!(result.hwnd, 2); // "Notepad" is a better match than "Another Notepad Window"

        // Test PID match
        let result = find_best_window_match("pid:101", windows.clone(), &sys).expect("Window not found");
        assert_eq!(result.hwnd, 1);

        // Test HWND match
        let result = find_best_window_match("hwnd:3", windows.clone(), &sys).expect("Window not found");
        assert_eq!(result.hwnd, 3);
    }
}
