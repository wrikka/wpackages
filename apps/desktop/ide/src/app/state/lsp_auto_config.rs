use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LspServerConfig {
    pub id: String,
    pub name: String,
    pub languages: Vec<String>,
    pub command: String,
    pub args: Vec<String>,
    pub env_vars: HashMap<String, String>,
    pub auto_install: bool,
    pub install_command: Option<String>,
    pub version: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LspDetectionResult {
    pub detected_servers: Vec<LspServerConfig>,
    pub missing_servers: Vec<LspServerConfig>,
    pub conflicts: Vec<LspConflict>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LspConflict {
    pub server1: String,
    pub server2: String,
    pub reason: ConflictReason,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConflictReason {
    SameLanguage,
    DuplicateCommand,
}

#[derive(Debug, Clone, Default)]
pub struct LspAutoConfigState {
    pub detected_configs: Vec<LspServerConfig>,
    pub active_servers: HashMap<String, LspServerConfig>,
    pub installation_status: HashMap<String, InstallationStatus>,
    pub auto_detect_enabled: bool,
    pub auto_install_enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InstallationStatus {
    NotInstalled,
    Installing,
    Installed,
    Failed(String),
}

impl LspAutoConfigState {
    pub fn new() -> Self {
        Self {
            detected_configs: Vec::new(),
            active_servers: HashMap::new(),
            installation_status: HashMap::new(),
            auto_detect_enabled: true,
            auto_install_enabled: false,
        }
    }

    pub fn detect_language_servers(&mut self, project_path: &PathBuf) -> LspDetectionResult {
        let mut detected = Vec::new();
        let mut missing = Vec::new();
        let mut conflicts = Vec::new();

        self.detect_rust_servers(project_path, &mut detected);
        self.detect_typescript_servers(project_path, &mut detected);
        self.detect_python_servers(project_path, &mut detected);
        self.detect_go_servers(project_path, &mut detected);
        self.detect_java_servers(project_path, &mut detected);

        LspDetectionResult {
            detected_servers: detected,
            missing_servers: missing,
            conflicts,
        }
    }

    fn detect_rust_servers(&self, path: &PathBuf, detected: &mut Vec<LspServerConfig>) {
        if path.join("Cargo.toml").exists() {
            detected.push(LspServerConfig {
                id: "rust-analyzer".to_string(),
                name: "Rust Analyzer".to_string(),
                languages: vec!["rust".to_string()],
                command: "rust-analyzer".to_string(),
                args: vec![],
                env_vars: HashMap::new(),
                auto_install: true,
                install_command: Some("rustup component add rust-analyzer".to_string()),
                version: None,
            });
        }
    }

    fn detect_typescript_servers(&self, path: &PathBuf, detected: &mut Vec<LspServerConfig>) {
        if path.join("package.json").exists() || path.join("tsconfig.json").exists() {
            detected.push(LspServerConfig {
                id: "typescript-language-server".to_string(),
                name: "TypeScript Language Server".to_string(),
                languages: vec!["typescript".to_string(), "javascript".to_string()],
                command: "typescript-language-server".to_string(),
                args: vec!["--stdio".to_string()],
                env_vars: HashMap::new(),
                auto_install: true,
                install_command: Some("npm install -g typescript-language-server".to_string()),
                version: None,
            });
        }
    }

    fn detect_python_servers(&self, path: &PathBuf, detected: &mut Vec<LspServerConfig>) {
        if path.join("pyproject.toml").exists() || path.join("requirements.txt").exists() {
            detected.push(LspServerConfig {
                id: "pyright".to_string(),
                name: "Pyright".to_string(),
                languages: vec!["python".to_string()],
                command: "pyright".to_string(),
                args: vec!["--stdio".to_string()],
                env_vars: HashMap::new(),
                auto_install: true,
                install_command: Some("npm install -g pyright".to_string()),
                version: None,
            });
        }
    }

    fn detect_go_servers(&self, path: &PathBuf, detected: &mut Vec<LspServerConfig>) {
        if path.join("go.mod").exists() {
            detected.push(LspServerConfig {
                id: "gopls".to_string(),
                name: "gopls".to_string(),
                languages: vec!["go".to_string()],
                command: "gopls".to_string(),
                args: vec!["serve".to_string()],
                env_vars: HashMap::new(),
                auto_install: true,
                install_command: Some("go install golang.org/x/tools/gopls@latest".to_string()),
                version: None,
            });
        }
    }

    fn detect_java_servers(&self, path: &PathBuf, detected: &mut Vec<LspServerConfig>) {
        if path.join("pom.xml").exists() || path.join("build.gradle").exists() {
            detected.push(LspServerConfig {
                id: "jdtls".to_string(),
                name: "Eclipse JDT Language Server".to_string(),
                languages: vec!["java".to_string()],
                command: "jdtls".to_string(),
                args: vec![],
                env_vars: HashMap::new(),
                auto_install: true,
                install_command: None,
                version: None,
            });
        }
    }

    pub fn install_server(&mut self, server_id: &str) -> Result<(), String> {
        if let Some(config) = self.detected_configs.iter().find(|c| c.id == server_id) {
            if let Some(install_cmd) = &config.install_command {
                self.installation_status.insert(
                    server_id.to_string(),
                    InstallationStatus::Installing,
                );
            }
        }
        Ok(())
    }
}
