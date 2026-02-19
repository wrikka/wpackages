use crate::error::{Error, Result};
use crate::protocol::Command;
use sysinfo::{System, get_current_pid, Pid};

pub fn handle_launch(command: &Command) -> Result<Option<serde_json::Value>> {
    let path = command.params["path"]
        .as_str()
        .ok_or_else(|| Error::InvalidCommand("Missing 'path' for launch".to_string()))?;

    std::process::Command::new(path)
        .spawn()
        .map_err(|e| Error::Computer(format!("Failed to launch '{}': {}", path, e)))?;

    Ok(Some(serde_json::json!({ "launched": path })))
}

pub fn handle_kill(command: &Command) -> Result<Option<serde_json::Value>> {
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
