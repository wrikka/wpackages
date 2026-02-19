use crate::daemon::{enumerate_windows, find_window_by_selector};
use crate::error::{Error, Result};
use crate::protocol::Command;


pub fn handle_list_windows() -> Result<Option<serde_json::Value>> {
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

pub fn handle_focus_window(command: &Command) -> Result<Option<serde_json::Value>> {
    #[cfg(windows)]
    {
        let hwnd_u64 = match command.params.get("hwnd").and_then(|v| v.as_u64()) {
            Some(h) => Ok(h),
            None => {
                let selector_str = command.params
                    .get("selector")
                    .and_then(|v| v.as_str())
                    .ok_or_else(|| Error::InvalidCommand("Missing hwnd/selector".to_string()))?;

                find_window_by_selector(selector_str).map(|w| w.hwnd)
            }
        }?;

        let hwnd = windows::Win32::Foundation::HWND(hwnd_u64 as isize);
        if unsafe { windows::Win32::UI::WindowsAndMessaging::SetForegroundWindow(hwnd) }.as_bool() == false {
            return Err(Error::Computer(format!(
                "SetForegroundWindow failed for hwnd=0x{:X}",
                hwnd_u64
            )));
        }

        let mut win_info = crate::daemon::WindowInfo {
            hwnd: hwnd_u64,
            pid: 0,
            title: String::new(),
        };

        if let Ok(windows) = enumerate_windows() {
            if let Some(found) = windows.into_iter().find(|x| x.hwnd == hwnd_u64) {
                win_info = found;
            }
        }

        return Ok(Some(serde_json::json!({ "hwnd": win_info.hwnd, "focused": true, "pid": win_info.pid, "title": win_info.title, })));
    }

    #[cfg(not(windows))]
    {
        let _ = command;
        Err(Error::InvalidCommand(
            "FocusWindow is only supported on Windows for now".to_string(),
        ))
    }
}

pub async fn handle_wait_for_element(command: &Command) -> Result<Option<serde_json::Value>> {
    let selector = command.params["selector"]
        .as_str()
        .ok_or_else(|| Error::InvalidCommand("Missing 'selector' for wait-for-element".to_string()))?;
    let timeout_secs = command.params["timeout"]
        .as_u64()
        .ok_or_else(|| Error::InvalidCommand("Missing 'timeout' for wait-for-element".to_string()))?;

    let start = tokio::time::Instant::now();
    let timeout = std::time::Duration::from_secs(timeout_secs);

    loop {
        #[cfg(windows)]
        {
            if find_window_by_selector(selector).is_ok() {
                return Ok(Some(serde_json::json!({ "found": true })))
            }
        }

        #[cfg(not(windows))]
        {
            return Err(Error::InvalidCommand("WaitForElement is only supported on Windows for now".to_string()));
        }

        if start.elapsed() > timeout {
            return Err(Error::Computer(format!("Timeout waiting for element: {}", selector)));
        }

        tokio::time::sleep(std::time::Duration::from_millis(500)).await;
    }
}
