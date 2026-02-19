use std::time::Duration;
use tracing::{debug, warn};

#[derive(Debug, Clone)]
pub struct ResourceLimits {
    pub max_memory_mb: usize,
    pub max_cpu_percent: f64,
    pub max_execution_time: Duration,
    pub max_file_handles: usize,
}

impl Default for ResourceLimits {
    fn default() -> Self {
        Self {
            max_memory_mb: 512,
            max_cpu_percent: 80.0,
            max_execution_time: Duration::from_secs(300),
            max_file_handles: 1024,
        }
    }
}

#[derive(Debug, Clone)]
pub struct SandboxConfig {
    pub resource_limits: ResourceLimits,
    pub network_access: bool,
    pub file_system_access: bool,
    pub allowed_paths: Vec<String>,
}

impl Default for SandboxConfig {
    fn default() -> Self {
        Self {
            resource_limits: ResourceLimits::default(),
            network_access: false,
            file_system_access: false,
            allowed_paths: Vec::new(),
        }
    }
}

pub struct Sandbox {
    config: SandboxConfig,
    active: bool,
}

impl Sandbox {
    pub fn new(config: SandboxConfig) -> Self {
        Self {
            config,
            active: false,
        }
    }

    pub async fn create(&mut self) -> Result<(), String> {
        debug!("Creating sandbox with resource limits");

        self.active = true;
        Ok(())
    }

    pub async fn destroy(&mut self) -> Result<(), String> {
        debug!("Destroying sandbox");

        self.active = false;
        Ok(())
    }

    pub async fn execute<F, R>(&self, f: F) -> Result<R, String>
    where
        F: FnOnce() -> R,
    {
        if !self.active {
            return Err("Sandbox is not active".to_string());
        }

        debug!("Executing function in sandbox");

        let result = f();

        Ok(result)
    }

    pub fn is_active(&self) -> bool {
        self.active
    }

    pub fn config(&self) -> &SandboxConfig {
        &self.config
    }
}
