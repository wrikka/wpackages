//! Sysinfo adapter for process management

use crate::error::{Error, Result};
use crate::services::ProcessInfo;

/// Sysinfo adapter wrapper
pub struct SysinfoAdapter {
    system: sysinfo::System,
}

impl SysinfoAdapter {
    /// Create new sysinfo adapter
    pub fn new() -> Self {
        let mut system = sysinfo::System::new_all();
        system.refresh_processes();
        Self { system }
    }

    /// Refresh process list
    pub fn refresh(&mut self) {
        self.system.refresh_processes();
    }

    /// List all processes
    pub fn processes(&self) -> Vec<ProcessInfo> {
        self.system
            .processes()
            .iter()
            .map(|(pid, proc)| ProcessInfo {
                pid: pid.as_u32(),
                name: proc.name().to_string(),
                memory_usage: proc.memory(),
            })
            .collect()
    }

    /// Find process by name
    pub fn find_by_name(&self, name: &str) -> Option<ProcessInfo> {
        self.system
            .processes()
            .iter()
            .find(|(_, proc)| proc.name().eq_ignore_ascii_case(name))
            .map(|(pid, proc)| ProcessInfo {
                pid: pid.as_u32(),
                name: proc.name().to_string(),
                memory_usage: proc.memory(),
            })
    }

    /// Kill process by PID
    pub fn kill(&mut self, pid: u32) -> Result<()> {
        let pid = sysinfo::Pid::from_u32(pid);
        self.refresh();
        
        if let Some(process) = self.system.process(pid) {
            process.kill()
                .then_some(())
                .ok_or_else(|| Error::ProcessOperation("Failed to kill process".to_string()))
        } else {
            Err(Error::ProcessNotFound(pid.to_string()))
        }
    }
}

impl Default for SysinfoAdapter {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sysinfo_adapter_processes() {
        let adapter = SysinfoAdapter::new();
        let processes = adapter.processes();
        assert!(!processes.is_empty());
    }
}
