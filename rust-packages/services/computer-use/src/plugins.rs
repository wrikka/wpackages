//! Plugin System
//!
//! Feature 6: Extensible plugin architecture

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use serde::{Deserialize, Serialize};
use async_trait::async_trait;
use crate::error::{Error, Result};
use crate::types::{Action, Command, Response};

/// Plugin metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginMeta {
    pub id: String,
    pub name: String,
    pub version: String,
    pub author: String,
    pub description: String,
    pub api_version: String,
    pub dependencies: Vec<String>,
    pub permissions: Vec<PluginPermission>,
}

/// Plugin permissions
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PluginPermission {
    ScreenCapture,
    MouseControl,
    KeyboardControl,
    FileSystem,
    Network,
    ProcessControl,
}

/// Plugin trait
#[async_trait]
pub trait Plugin: Send + Sync {
    /// Get plugin metadata
    fn meta(&self) -> &PluginMeta;

    /// Initialize plugin
    async fn init(&mut self) -> Result<()>;

    /// Shutdown plugin
    async fn shutdown(&mut self) -> Result<()>;

    /// Handle command
    async fn handle_command(&self, command: &Command) -> Result<Option<Response>>;

    /// Get custom actions
    fn custom_actions(&self) -> Vec<String>;
}

/// Plugin manager
pub struct PluginManager {
    plugins_dir: PathBuf,
    plugins: HashMap<String, Box<dyn Plugin>>,
    hooks: PluginHooks,
}

/// Plugin hooks for events
pub struct PluginHooks {
    pub on_action_start: Vec<String>,
    pub on_action_end: Vec<String>,
    pub on_error: Vec<String>,
}

impl PluginHooks {
    pub const fn new() -> Self {
        Self {
            on_action_start: Vec::new(),
            on_action_end: Vec::new(),
            on_error: Vec::new(),
        }
    }
}

impl PluginManager {
    /// Create new plugin manager
    pub fn new(plugins_dir: impl AsRef<Path>) -> Self {
        Self {
            plugins_dir: plugins_dir.as_ref().to_path_buf(),
            plugins: HashMap::new(),
            hooks: PluginHooks::new(),
        }
    }

    /// Create with default directory
    pub fn default_dir() -> Self {
        Self::new("plugins")
    }

    /// Register a plugin
    pub fn register<P: Plugin + 'static>(&mut self, plugin: P) {
        let id = plugin.meta().id.clone();
        self.plugins.insert(id, Box::new(plugin));
    }

    /// Initialize all plugins
    pub async fn init_all(&mut self) -> Result<()> {
        for plugin in self.plugins.values_mut() {
            plugin.init().await?;
        }
        Ok(())
    }

    /// Shutdown all plugins
    pub async fn shutdown_all(&mut self) -> Result<()> {
        for plugin in self.plugins.values_mut() {
            plugin.shutdown().await?;
        }
        Ok(())
    }

    /// Get plugin by ID
    pub fn get(&self, id: &str) -> Option<&dyn Plugin> {
        self.plugins.get(id).map(|p| p.as_ref())
    }

    /// Handle command through plugins
    pub async fn handle_command(&self, command: &Command) -> Result<Option<Response>> {
        for plugin in self.plugins.values() {
            if let Some(response) = plugin.handle_command(command).await? {
                return Ok(Some(response));
            }
        }
        Ok(None)
    }

    /// List all plugins
    pub fn list(&self) -> Vec<&PluginMeta> {
        self.plugins.values().map(|p| p.meta()).collect()
    }

    /// Check if action is handled by plugin
    pub fn handles_action(&self, action: &str) -> bool {
        self.plugins.values().any(|p| {
            p.custom_actions().iter().any(|a| a == action)
        })
    }
}

/// Built-in debug plugin
pub struct DebugPlugin {
    meta: PluginMeta,
    log_commands: bool,
}

impl DebugPlugin {
    pub fn new() -> Self {
        Self {
            meta: PluginMeta {
                id: "debug".to_string(),
                name: "Debug Plugin".to_string(),
                version: "1.0.0".to_string(),
                author: "WAI".to_string(),
                description: "Debug logging for commands".to_string(),
                api_version: "1.0".to_string(),
                dependencies: vec![],
                permissions: vec![],
            },
            log_commands: true,
        }
    }
}

impl Default for DebugPlugin {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl Plugin for DebugPlugin {
    fn meta(&self) -> &PluginMeta {
        &self.meta
    }

    async fn init(&mut self) -> Result<()> {
        tracing::info!("Debug plugin initialized");
        Ok(())
    }

    async fn shutdown(&mut self) -> Result<()> {
        tracing::info!("Debug plugin shutdown");
        Ok(())
    }

    async fn handle_command(&self, command: &Command) -> Result<Option<Response>> {
        if self.log_commands {
            tracing::debug!("Command: {:?}", command);
        }
        Ok(None)
    }

    fn custom_actions(&self) -> Vec<String> {
        vec!["debug_log".to_string()]
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_plugin_manager() {
        let mut manager = PluginManager::default_dir();
        manager.register(DebugPlugin::new());
        
        manager.init_all().await.unwrap();
        
        let plugins = manager.list();
        assert_eq!(plugins.len(), 1);
    }
}
