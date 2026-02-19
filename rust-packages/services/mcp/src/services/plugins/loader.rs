use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use tracing::{debug, info, warn};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginMetadata {
    pub name: String,
    pub version: String,
    pub description: Option<String>,
    pub author: Option<String>,
    pub entry_point: String,
    pub dependencies: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct PluginConfig {
    pub hot_reload: bool,
    pub auto_discovery: bool,
    pub plugin_directory: PathBuf,
}

impl Default for PluginConfig {
    fn default() -> Self {
        Self {
            hot_reload: true,
            auto_discovery: true,
            plugin_directory: PathBuf::from("./plugins"),
        }
    }
}

pub struct PluginLoader {
    config: PluginConfig,
    loaded_plugins: Vec<PluginMetadata>,
}

impl PluginLoader {
    pub fn new(config: PluginConfig) -> Self {
        Self {
            config,
            loaded_plugins: Vec::new(),
        }
    }

    pub async fn load_plugin(&mut self, path: PathBuf) -> Result<PluginMetadata, String> {
        debug!("Loading plugin from: {:?}", path);

        let metadata = PluginMetadata {
            name: "example_plugin".to_string(),
            version: "0.1.0".to_string(),
            description: Some("An example plugin".to_string()),
            author: Some("wterminal".to_string()),
            entry_point: "init".to_string(),
            dependencies: Vec::new(),
        };

        self.loaded_plugins.push(metadata.clone());
        info!("Plugin '{}' loaded successfully", metadata.name);

        Ok(metadata)
    }

    pub async fn unload_plugin(&mut self, name: &str) -> Result<(), String> {
        debug!("Unloading plugin: {}", name);

        if let Some(pos) = self.loaded_plugins.iter().position(|p| p.name == name) {
            self.loaded_plugins.remove(pos);
            info!("Plugin '{}' unloaded successfully", name);
            Ok(())
        } else {
            Err(format!("Plugin not found: {}", name))
        }
    }

    pub async fn reload_plugin(&mut self, name: &str) -> Result<PluginMetadata, String> {
        warn!("Reloading plugin: {}", name);

        if let Some(pos) = self.loaded_plugins.iter().position(|p| p.name == name) {
            let metadata = self.loaded_plugins[pos].clone();
            self.loaded_plugins.remove(pos);
            self.loaded_plugins.push(metadata.clone());
            info!("Plugin '{}' reloaded successfully", name);
            Ok(metadata)
        } else {
            Err(format!("Plugin not found: {}", name))
        }
    }

    pub fn list_plugins(&self) -> Vec<PluginMetadata> {
        self.loaded_plugins.clone()
    }

    pub fn get_plugin(&self, name: &str) -> Option<&PluginMetadata> {
        self.loaded_plugins.iter().find(|p| p.name == name)
    }

    pub async fn discover_plugins(&mut self) -> Vec<PluginMetadata> {
        debug!("Discovering plugins in: {:?}", self.config.plugin_directory);

        let mut discovered = Vec::new();

        let metadata = PluginMetadata {
            name: "discovered_plugin".to_string(),
            version: "1.0.0".to_string(),
            description: Some("Auto-discovered plugin".to_string()),
            author: None,
            entry_point: "init".to_string(),
            dependencies: Vec::new(),
        };

        discovered.push(metadata);

        discovered
    }
}
