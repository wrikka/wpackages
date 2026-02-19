use crate::types::config::PluginConfig;
use serde::Serialize;
use std::io::Write;

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum PluginEvent<'a> {
    BeforeTask {
        workspace: &'a str,
        task: &'a str,
        hash: &'a str,
    },
    CacheHit {
        workspace: &'a str,
        task: &'a str,
        hash: &'a str,
        source: &'a str,
    },
    CacheMiss {
        workspace: &'a str,
        task: &'a str,
        hash: &'a str,
    },
    AfterTask {
        workspace: &'a str,
        task: &'a str,
        hash: &'a str,
        success: bool,
    },
}

#[derive(Debug, Clone)]
pub struct PluginManager {
    plugins: Vec<PluginConfig>,
}

impl PluginManager {
    pub fn new(configs: &[PluginConfig]) -> Self {
        Self {
            plugins: configs.iter().filter(|p| p.enabled).cloned().collect(),
        }
    }

    pub fn is_enabled(&self) -> bool {
        !self.plugins.is_empty()
    }

    pub fn emit(&self, event: PluginEvent<'_>) {
        if self.plugins.is_empty() {
            return;
        }

        let json = match serde_json::to_string(&event) {
            Ok(v) => v,
            Err(e) => {
                eprintln!("plugin: failed to serialize event: {}", e);
                return;
            }
        };

        for plugin in &self.plugins {
            let mut cmd = std::process::Command::new(&plugin.command);
            cmd.args(&plugin.args);
            cmd.stdin(std::process::Stdio::piped());
            cmd.stdout(std::process::Stdio::null());
            cmd.stderr(std::process::Stdio::piped());

            let mut child = match cmd.spawn() {
                Ok(c) => c,
                Err(e) => {
                    eprintln!("plugin: failed to spawn '{}': {}", plugin.command, e);
                    continue;
                }
            };

            if let Some(mut stdin) = child.stdin.take() {
                if stdin.write_all(json.as_bytes()).is_err() || stdin.write_all(b"\n").is_err() {
                    eprintln!("plugin: failed to write stdin for '{}'", plugin.command);
                }
            }

            match child.wait_with_output() {
                Ok(out) => {
                    if !out.status.success() {
                        let stderr = String::from_utf8_lossy(&out.stderr);
                        eprintln!(
                            "plugin: '{}' exited with {}: {}",
                            plugin.command,
                            out.status,
                            stderr.trim()
                        );
                    }
                }
                Err(e) => {
                    eprintln!("plugin: failed to wait for '{}': {}", plugin.command, e);
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn unique_temp_dir() -> std::path::PathBuf {
        let mut dir = std::env::temp_dir();
        let pid = std::process::id();
        let nanos = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_nanos();
        dir.push(format!("wmorepo-plugin-test-{}-{}", pid, nanos));
        dir
    }

    #[test]
    fn emits_event_to_process() {
        let dir = unique_temp_dir();
        std::fs::create_dir_all(&dir).unwrap();
        let out_file = dir.join("out.txt");

        #[cfg(windows)]
        let plugin = PluginConfig {
            command: "powershell".to_string(),
            args: vec![
                "-NoProfile".to_string(),
                "-Command".to_string(),
                format!(
                    "$input | Out-File -FilePath '{}' -Encoding utf8",
                    out_file.to_string_lossy().replace('\'', "''")
                ),
            ],
            enabled: true,
        };

        #[cfg(unix)]
        let plugin = PluginConfig {
            command: "sh".to_string(),
            args: vec![
                "-c".to_string(),
                format!("cat > '{}'", out_file.to_string_lossy()),
            ],
            enabled: true,
        };

        let manager = PluginManager::new(&[plugin]);
        manager.emit(PluginEvent::BeforeTask {
            workspace: "a",
            task: "build",
            hash: "h",
        });

        let content = std::fs::read_to_string(&out_file).unwrap();
        assert!(content.contains("\"type\":\"before_task\""));

        let _ = std::fs::remove_dir_all(&dir);
    }
}
