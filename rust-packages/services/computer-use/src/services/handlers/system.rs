use crate::error::{Error, Result};
use crate::protocol::Command;
use sysinfo::{System, get_current_pid, Pid};

pub fn handle_list_processes() -> Result<Option<serde_json::Value>> {
    let mut sys = System::new_all();
    sys.refresh_processes();

    let mut procs: Vec<serde_json::Value> = Vec::new();
    for (pid, proc_) in sys.processes() {
        procs.push(serde_json::json!({ "pid": pid.as_u32(), "name": proc_.name() }));
    }

    Ok(Some(serde_json::Value::Array(procs)))
}
