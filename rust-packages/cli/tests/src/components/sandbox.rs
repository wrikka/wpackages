use crate::error::{TestingError, TestingResult};
use crate::types::TestConfig;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::time::Duration;
use tracing::{debug, info, warn};

#[derive(Debug, Clone)]
pub struct SandboxConfig {
    pub memory_limit: Option<u64>,
    pub cpu_limit: Option<f32>,
    pub time_limit: Option<Duration>,
    pub network_enabled: bool,
    pub filesystem_ro: bool,
    pub allowed_paths: Vec<PathBuf>,
    pub env_whitelist: Vec<String>,
}

impl Default for SandboxConfig {
    fn default() -> Self {
        Self {
            memory_limit: None,
            cpu_limit: None,
            time_limit: Some(Duration::from_secs(60)),
            network_enabled: false,
            filesystem_ro: true,
            allowed_paths: Vec::new(),
            env_whitelist: vec!["PATH".to_string(), "HOME".to_string()],
        }
    }
}

pub struct TestSandbox {
    config: SandboxConfig,
    work_dir: PathBuf,
}

impl TestSandbox {
    pub fn new(work_dir: PathBuf) -> Self {
        Self {
            config: SandboxConfig::default(),
            work_dir,
        }
    }

    pub fn with_config(mut self, config: SandboxConfig) -> Self {
        self.config = config;
        self
    }

    pub fn from_test_config(config: &TestConfig) -> Self {
        Self {
            config: SandboxConfig {
                time_limit: config.timeout,
                network_enabled: false,
                ..Default::default()
            },
            work_dir: config.working_dir.clone().unwrap_or_else(|| std::env::temp_dir()),
        }
    }

    pub fn create(&self) -> TestingResult<SandboxHandle> {
        std::fs::create_dir_all(&self.work_dir)?;

        let handle = SandboxHandle {
            work_dir: self.work_dir.clone(),
            config: self.config.clone(),
        };

        info!("Created sandbox at {:?}", self.work_dir);
        Ok(handle)
    }

    pub fn config(&self) -> &SandboxConfig {
        &self.config
    }

    pub fn work_dir(&self) -> &PathBuf {
        &self.work_dir
    }
}

pub struct SandboxHandle {
    work_dir: PathBuf,
    config: SandboxConfig,
}

impl SandboxHandle {
    pub fn execute(&self, command: &str, args: &[&str]) -> TestingResult<SandboxResult> {
        let start = std::time::Instant::now();

        let mut cmd = Command::new(command);
        cmd.args(args)
            .current_dir(&self.work_dir)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());

        for env in &self.config.env_whitelist {
            if let Ok(value) = std::env::var(env) {
                cmd.env(env, value);
            }
        }

        if !self.config.network_enabled {
            cmd.env("TEST_NO_NETWORK", "1");
        }

        let output = cmd.output().map_err(|e| {
            TestingError::sandbox_error(format!("Failed to execute command: {}", e))
        })?;

        let duration = start.elapsed();
        let timed_out = self.config.time_limit.map(|limit| duration > limit).unwrap_or(false);

        Ok(SandboxResult {
            exit_code: output.status.code(),
            stdout: String::from_utf8_lossy(&output.stdout).to_string(),
            stderr: String::from_utf8_lossy(&output.stderr).to_string(),
            duration,
            timed_out,
        })
    }

    pub fn write_file(&self, path: &PathBuf, content: &str) -> TestingResult<()> {
        let full_path = self.work_dir.join(path);
        if let Some(parent) = full_path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        std::fs::write(&full_path, content)?;
        debug!("Wrote file: {:?}", full_path);
        Ok(())
    }

    pub fn read_file(&self, path: &PathBuf) -> TestingResult<String> {
        let full_path = self.work_dir.join(path);
        std::fs::read_to_string(&full_path).map_err(|e| {
            TestingError::sandbox_error(format!("Failed to read file: {}", e))
        })
    }

    pub fn cleanup(&self) -> TestingResult<()> {
        if self.work_dir.exists() {
            std::fs::remove_dir_all(&self.work_dir)?;
            debug!("Cleaned up sandbox: {:?}", self.work_dir);
        }
        Ok(())
    }

    pub fn work_dir(&self) -> &PathBuf {
        &self.work_dir
    }
}

impl Drop for SandboxHandle {
    fn drop(&mut self) {
        let _ = self.cleanup();
    }
}

#[derive(Debug, Clone)]
pub struct SandboxResult {
    pub exit_code: Option<i32>,
    pub stdout: String,
    pub stderr: String,
    pub duration: Duration,
    pub timed_out: bool,
}

impl SandboxResult {
    pub fn success(&self) -> bool {
        self.exit_code == Some(0) && !self.timed_out
    }

    pub fn output(&self) -> String {
        if self.stderr.is_empty() {
            self.stdout.clone()
        } else {
            format!("{}\n{}", self.stdout, self.stderr)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_sandbox_creation() {
        let temp_dir = TempDir::new().unwrap();
        let sandbox = TestSandbox::new(temp_dir.path().join("sandbox"));

        let handle = sandbox.create().unwrap();
        assert!(handle.work_dir().exists());
    }

    #[test]
    fn test_sandbox_write_read() {
        let temp_dir = TempDir::new().unwrap();
        let sandbox = TestSandbox::new(temp_dir.path().join("sandbox"));
        let handle = sandbox.create().unwrap();

        handle.write_file(&PathBuf::from("test.txt"), "hello").unwrap();
        let content = handle.read_file(&PathBuf::from("test.txt")).unwrap();

        assert_eq!(content, "hello");
    }

    #[test]
    fn test_sandbox_config_defaults() {
        let config = SandboxConfig::default();
        assert!(!config.network_enabled);
        assert!(config.filesystem_ro);
    }
}
