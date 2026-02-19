//! Process management service

use async_trait::async_trait;
use crate::error::Result;

/// Process information
#[derive(Debug, Clone)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub memory_usage: u64,
}

/// Process service trait
#[async_trait]
pub trait ProcessService: Send + Sync {
    /// List running processes
    async fn list(&self) -> Result<Vec<ProcessInfo>>;

    /// Kill a process by PID
    async fn kill(&self, pid: u32) -> Result<()>;

    /// Kill a process by name
    async fn kill_by_name(&self, name: &str) -> Result<()>;

    /// Launch a process
    async fn launch(&self, path: &str) -> Result<u32>;
}

/// Sysinfo-based process service
pub struct SysinfoProcessService;

impl SysinfoProcessService {
    /// Create new sysinfo process service
    pub const fn new() -> Self {
        Self
    }
}

impl Default for SysinfoProcessService {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl ProcessService for SysinfoProcessService {
    async fn list(&self) -> Result<Vec<ProcessInfo>> {
        let mut sys = sysinfo::System::new_all();
        sys.refresh_processes();

        Ok(sys.processes()
            .iter()
            .map(|(pid, proc)| ProcessInfo {
                pid: pid.as_u32(),
                name: proc.name().to_string(),
                memory_usage: proc.memory(),
            })
            .collect())
    }

    async fn kill(&self, pid: u32) -> Result<()> {
        let mut sys = sysinfo::System::new_all();
        sys.refresh_processes();

        let pid = sysinfo::Pid::from_u32(pid);
        if let Some(process) = sys.process(pid) {
            process.kill()
                .then_some(())
                .ok_or_else(|| crate::error::Error::ProcessOperation("Failed to kill process".to_string()))
        } else {
            Err(crate::error::Error::ProcessNotFound(pid.to_string()))
        }
    }

    async fn kill_by_name(&self, name: &str) -> Result<()> {
        let mut sys = sysinfo::System::new_all();
        sys.refresh_processes();

        let process = sys.processes()
            .iter()
            .find(|(_, proc)| proc.name().eq_ignore_ascii_case(name));

        if let Some((pid, _)) = process {
            sys.refresh_processes();
            if let Some(p) = sys.process(*pid) {
                p.kill()
                    .then_some(())
                    .ok_or_else(|| crate::error::Error::ProcessOperation("Failed to kill process".to_string()))
            } else {
                Err(crate::error::Error::ProcessNotFound(name.to_string()))
            }
        } else {
            Err(crate::error::Error::ProcessNotFound(name.to_string()))
        }
    }

    async fn launch(&self, path: &str) -> Result<u32> {
        let child = std::process::Command::new(path)
            .spawn()
            .map_err(|e| crate::error::Error::ProcessOperation(e.to_string()))?;
        Ok(child.id())
    }
}
