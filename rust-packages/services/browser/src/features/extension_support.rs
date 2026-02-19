use crate::browser::BrowserManager;
use crate::error::Result;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionConfig {
    pub path: PathBuf,
    pub id: Option<String>,
    pub enabled: bool,
    pub allow_in_incognito: bool,
    pub options: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionInfo {
    pub id: String,
    pub name: String,
    pub version: String,
    pub description: Option<String>,
    pub enabled: bool,
    pub permissions: Vec<String>,
    pub host_permissions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionManager {
    extensions: Vec<ExtensionConfig>,
    extension_data_dir: PathBuf,
}

impl ExtensionManager {
    pub fn new(data_dir: PathBuf) -> Self {
        Self {
            extensions: Vec::new(),
            extension_data_dir: data_dir,
        }
    }

    pub fn add_extension(&mut self, config: ExtensionConfig) -> Result<()> {
        if !config.path.exists() {
            return Err(crate::error::Error::InvalidCommand(
                format!("Extension path does not exist: {:?}", config.path)
            ));
        }
        self.extensions.push(config);
        Ok(())
    }

    pub fn remove_extension(&mut self, extension_id: &str) {
        self.extensions.retain(|e| e.id.as_deref() != Some(extension_id));
    }

    pub fn list_extensions(&self) -> &[ExtensionConfig] {
        &self.extensions
    }

    pub fn get_chrome_args(&self) -> Vec<String> {
        let mut args = Vec::new();
        
        for extension in &self.extensions {
            if extension.enabled {
                let path_str = extension.path.to_string_lossy();
                args.push(format!("--load-extension={}", path_str));
                
                if extension.allow_in_incognito {
                    args.push(format!("--allow-incognito-extension={}", path_str));
                }
            }
        }
        
        args
    }

    pub fn install_from_chrome_web_store(
        &mut self,
        extension_id: &str,
    ) -> Result<ExtensionConfig> {
        // In production, this would download and install the extension
        // For now, this is a placeholder
        let config = ExtensionConfig {
            path: self.extension_data_dir.join(extension_id),
            id: Some(extension_id.to_string()),
            enabled: true,
            allow_in_incognito: false,
            options: None,
        };
        
        self.add_extension(config.clone())?;
        Ok(config)
    }

    pub fn detect_manifest(&self, path: &PathBuf) -> Result<ExtensionInfo> {
        // Read and parse manifest.json
        let manifest_path = path.join("manifest.json");
        if !manifest_path.exists() {
            return Err(crate::error::Error::InvalidCommand(
                "manifest.json not found in extension directory".to_string()
            ));
        }

        // Parse manifest (simplified)
        let info = ExtensionInfo {
            id: "unknown".to_string(),
            name: "Unknown Extension".to_string(),
            version: "1.0".to_string(),
            description: None,
            enabled: true,
            permissions: Vec::new(),
            host_permissions: Vec::new(),
        };

        Ok(info)
    }
}

impl Default for ExtensionManager {
    fn default() -> Self {
        Self::new(PathBuf::from("./extensions"))
    }
}
