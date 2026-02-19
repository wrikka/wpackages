use anyhow::Result;
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShellPlugin {
    pub id: String,
    pub name: String,
    pub script: String,
    pub enabled: bool,
    pub loaded: bool,
}

pub struct ShellPluginManager {
    plugins: Arc<RwLock<HashMap<String, ShellPlugin>>>,
    plugin_dir: std::path::PathBuf,
}

impl ShellPluginManager {
    pub fn new(plugin_dir: std::path::PathBuf) -> Result<Self> {
        std::fs::create_dir_all(&plugin_dir)?;
        Ok(Self {
            plugins: Arc::new(RwLock::new(HashMap::new())),
            plugin_dir,
        })
    }

    pub fn load_plugin(&self, id: String, name: String, script: String) -> Result<()> {
        let plugin = ShellPlugin {
            id: id.clone(),
            name,
            script,
            enabled: true,
            loaded: false,
        };

        self.plugins.write().insert(id, plugin);
        Ok(())
    }

    pub fn unload_plugin(&self, id: &str) {
        self.plugins.write().remove(id);
    }

    pub fn enable_plugin(&self, id: &str) {
        if let Some(mut plugin) = self.plugins.write().get_mut(id) {
            plugin.enabled = true;
        }
    }

    pub fn disable_plugin(&self, id: &str) {
        if let Some(mut plugin) = self.plugins.write().get_mut(id) {
            plugin.enabled = false;
        }
    }

    pub fn get_plugins(&self) -> Vec<ShellPlugin> {
        self.plugins.read().values().cloned().collect()
    }

    pub fn get_plugin(&self, id: &str) -> Option<ShellPlugin> {
        self.plugins.read().get(id).cloned()
    }

    pub fn execute_plugin(&self, id: &str, args: &[String]) -> Result<String> {
        let plugin = self
            .get_plugin(id)
            .ok_or_else(|| anyhow::anyhow!("Plugin not found"))?;

        if !plugin.enabled {
            return Err(anyhow::anyhow!("Plugin is disabled"));
        }

        let output = std::process::Command::new("sh")
            .arg("-c")
            .arg(&plugin.script)
            .args(args)
            .output()?;

        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    }
}
