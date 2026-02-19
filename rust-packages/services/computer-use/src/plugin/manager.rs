//! Plugin Architecture
//!
//! Third-party extensions for custom actions.

use crate::error::{Error, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tokio::fs;
use tokio::sync::{mpsc, Mutex};
use uuid::Uuid;

/// Plugin manager
pub struct PluginManager {
    plugins: Arc<Mutex<HashMap<String, Plugin>>>,
    hooks: Arc<Mutex<HashMap<String, Vec<PluginHook>>>>,
    event_tx: mpsc::Sender<PluginEvent>,
    plugin_dir: PathBuf,
    sandbox: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Plugin {
    pub id: String,
    pub name: String,
    pub version: String,
    pub description: String,
    pub author: String,
    pub entry_point: String,
    pub manifest: PluginManifest,
    pub state: PluginState,
    pub permissions: Vec<Permission>,
    pub config: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginManifest {
    pub name: String,
    pub version: String,
    pub description: String,
    pub main: String,
    pub hooks: Vec<HookDefinition>,
    pub permissions: Vec<String>,
    pub config_schema: Option<serde_json::Value>,
    pub dependencies: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HookDefinition {
    pub name: String,
    pub event: String,
    pub priority: u32,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum PluginState {
    Installed,
    Enabled,
    Disabled,
    Error(String),
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum Permission {
    FileRead,
    FileWrite,
    Network,
    Clipboard,
    Screenshot,
    ProcessExec,
    WindowControl,
    SystemInfo,
}

#[derive(Debug, Clone)]
pub struct PluginHook {
    pub plugin_id: String,
    pub hook_name: String,
    pub priority: u32,
    pub handler: Box<dyn Fn(&PluginContext) -> Result<HookResult> + Send + Sync>,
}

#[derive(Debug, Clone)]
pub struct PluginContext {
    pub event_type: String,
    pub event_data: serde_json::Value,
    pub plugin_config: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HookResult {
    Continue,
    Modified(serde_json::Value),
    Handled,
    Error(String),
}

#[derive(Debug, Clone)]
pub enum PluginEvent {
    Loaded { plugin_id: String },
    Unloaded { plugin_id: String },
    Enabled { plugin_id: String },
    Disabled { plugin_id: String },
    HookExecuted { plugin_id: String, hook: String },
    Error { plugin_id: String, error: String },
}

impl PluginManager {
    pub fn new(plugin_dir: PathBuf, sandbox: bool) -> (Self, mpsc::Receiver<PluginEvent>) {
        let (event_tx, event_rx) = mpsc::channel(100);
        
        let manager = Self {
            plugins: Arc::new(Mutex::new(HashMap::new())),
            hooks: Arc::new(Mutex::new(HashMap::new())),
            event_tx,
            plugin_dir,
            sandbox,
        };
        
        (manager, event_rx)
    }

    /// Install plugin from directory
    pub async fn install(&self, source_path: &Path) -> Result<String> {
        // Read manifest
        let manifest_path = source_path.join("manifest.json");
        let manifest_content = fs::read_to_string(&manifest_path).await
            .map_err(|e| Error::Io(e))?;
        let manifest: PluginManifest = serde_json::from_str(&manifest_content)
            .map_err(|e| Error::Protocol(e.to_string()))?;

        let plugin_id = Uuid::new_uuid().to_string();
        let plugin_dir = self.plugin_dir.join(&plugin_id);
        
        // Copy plugin files
        fs::create_dir_all(&plugin_dir).await.map_err(|e| Error::Io(e))?;
        
        let mut entries = fs::read_dir(source_path).await.map_err(|e| Error::Io(e))?;
        while let Ok(Some(entry)) = entries.next_entry().await {
            let src = entry.path();
            let dst = plugin_dir.join(entry.file_name());
            if src.is_file() {
                fs::copy(&src, &dst).await.map_err(|e| Error::Io(e))?;
            }
        }

        let plugin = Plugin {
            id: plugin_id.clone(),
            name: manifest.name.clone(),
            version: manifest.version.clone(),
            description: manifest.description.clone(),
            author: "Unknown".to_string(),
            entry_point: manifest.main.clone(),
            manifest: manifest.clone(),
            state: PluginState::Installed,
            permissions: manifest.permissions.iter().map(|p| match p.as_str() {
                "file:read" => Permission::FileRead,
                "file:write" => Permission::FileWrite,
                "network" => Permission::Network,
                "clipboard" => Permission::Clipboard,
                "screenshot" => Permission::Screenshot,
                "process:exec" => Permission::ProcessExec,
                "window:control" => Permission::WindowControl,
                "system:info" => Permission::SystemInfo,
                _ => Permission::SystemInfo,
            }).collect(),
            config: HashMap::new(),
        };

        self.plugins.lock().await.insert(plugin_id.clone(), plugin);
        let _ = self.event_tx.send(PluginEvent::Loaded { plugin_id: plugin_id.clone() }).await;

        Ok(plugin_id)
    }

    /// Enable plugin
    pub async fn enable(&self, plugin_id: &str) -> Result<()> {
        let mut plugins = self.plugins.lock().await;
        let plugin = plugins.get_mut(plugin_id)
            .ok_or_else(|| Error::InvalidCommand(format!("Plugin {} not found", plugin_id)))?;
        
        plugin.state = PluginState::Enabled;
        drop(plugins);

        // Register hooks
        self.register_hooks(plugin_id).await?;
        
        let _ = self.event_tx.send(PluginEvent::Enabled { plugin_id: plugin_id.to_string() }).await;
        Ok(())
    }

    /// Disable plugin
    pub async fn disable(&self, plugin_id: &str) -> Result<()> {
        let mut plugins = self.plugins.lock().await;
        let plugin = plugins.get_mut(plugin_id)
            .ok_or_else(|| Error::InvalidCommand(format!("Plugin {} not found", plugin_id)))?;
        
        plugin.state = PluginState::Disabled;
        drop(plugins);

        // Unregister hooks
        self.unregister_hooks(plugin_id).await;
        
        let _ = self.event_tx.send(PluginEvent::Disabled { plugin_id: plugin_id.to_string() }).await;
        Ok(())
    }

    /// Uninstall plugin
    pub async fn uninstall(&self, plugin_id: &str) -> Result<()> {
        // Disable first
        self.disable(plugin_id).await.ok();
        
        // Remove from registry
        self.plugins.lock().await.remove(plugin_id);
        
        // Delete files
        let plugin_dir = self.plugin_dir.join(plugin_id);
        let _ = fs::remove_dir_all(plugin_dir).await;
        
        let _ = self.event_tx.send(PluginEvent::Unloaded { plugin_id: plugin_id.to_string() }).await;
        Ok(())
    }

    /// List all plugins
    pub async fn list_plugins(&self) -> Vec<Plugin> {
        self.plugins.lock().await.values().cloned().collect()
    }

    /// Get plugin
    pub async fn get_plugin(&self, plugin_id: &str) -> Option<Plugin> {
        self.plugins.lock().await.get(plugin_id).cloned()
    }

    /// Update plugin config
    pub async fn update_config(&self, plugin_id: &str, config: HashMap<String, serde_json::Value>) -> Result<()> {
        let mut plugins = self.plugins.lock().await;
        let plugin = plugins.get_mut(plugin_id)
            .ok_or_else(|| Error::InvalidCommand(format!("Plugin {} not found", plugin_id)))?;
        
        plugin.config = config;
        Ok(())
    }

    /// Execute hook
    pub async fn execute_hook(&self, event: &str, data: serde_json::Value) -> Result<HookResult> {
        let hooks = self.hooks.lock().await;
        let event_hooks = hooks.get(event).cloned().unwrap_or_default();
        drop(hooks);

        let mut result = HookResult::Continue;
        
        for hook in event_hooks {
            let plugins = self.plugins.lock().await;
            let plugin = plugins.get(&hook.plugin_id).cloned();
            drop(plugins);
            
            if let Some(plugin) = plugin {
                if plugin.state == PluginState::Enabled {
                    let context = PluginContext {
                        event_type: event.to_string(),
                        event_data: data.clone(),
                        plugin_config: plugin.config.clone(),
                    };
                    
                    result = (hook.handler)(&context)?;
                    
                    let _ = self.event_tx.send(PluginEvent::HookExecuted {
                        plugin_id: hook.plugin_id.clone(),
                        hook: hook.hook_name.clone(),
                    }).await;
                    
                    match result {
                        HookResult::Handled | HookResult::Error(_) => break,
                        _ => {}
                    }
                }
            }
        }

        Ok(result)
    }

    async fn register_hooks(&self, plugin_id: &str) -> Result<()> {
        let plugins = self.plugins.lock().await;
        let plugin = plugins.get(plugin_id).cloned()
            .ok_or_else(|| Error::InvalidCommand(format!("Plugin {} not found", plugin_id)))?;
        drop(plugins);

        let mut hooks = self.hooks.lock().await;
        
        for hook_def in &plugin.manifest.hooks {
            let hook = PluginHook {
                plugin_id: plugin_id.to_string(),
                hook_name: hook_def.name.clone(),
                priority: hook_def.priority,
                handler: Box::new(|_ctx| Ok(HookResult::Continue)),
            };
            
            hooks.entry(hook_def.event.clone())
                .or_insert_with(Vec::new)
                .push(hook);
            
            // Sort by priority
            if let Some(event_hooks) = hooks.get_mut(&hook_def.event) {
                event_hooks.sort_by(|a, b| a.priority.cmp(&b.priority));
            }
        }

        Ok(())
    }

    async fn unregister_hooks(&self, plugin_id: &str) {
        let mut hooks = self.hooks.lock().await;
        
        for event_hooks in hooks.values_mut() {
            event_hooks.retain(|h| h.plugin_id != plugin_id);
        }
    }

    /// Check if plugin has permission
    pub async fn has_permission(&self, plugin_id: &str, permission: Permission) -> bool {
        let plugins = self.plugins.lock().await;
        if let Some(plugin) = plugins.get(plugin_id) {
            plugin.permissions.contains(&permission) && plugin.state == PluginState::Enabled
        } else {
            false
        }
    }

    /// Get available actions from plugins
    pub async fn get_plugin_actions(&self) -> Vec<PluginAction> {
        let plugins = self.plugins.lock().await;
        let mut actions = vec![];
        
        for plugin in plugins.values() {
            if plugin.state == PluginState::Enabled {
                for hook in &plugin.manifest.hooks {
                    if hook.event.starts_with("action:") {
                        actions.push(PluginAction {
                            plugin_id: plugin.id.clone(),
                            plugin_name: plugin.name.clone(),
                            action_name: hook.name.clone(),
                            description: format!("{}: {}", plugin.name, hook.name),
                        });
                    }
                }
            }
        }
        
        actions
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginAction {
    pub plugin_id: String,
    pub plugin_name: String,
    pub action_name: String,
    pub description: String,
}

/// Built-in plugin examples
pub mod examples {
    use super::*;

    pub fn create_example_manifest() -> PluginManifest {
        PluginManifest {
            name: "Example Plugin".to_string(),
            version: "1.0.0".to_string(),
            description: "An example plugin".to_string(),
            main: "index.js".to_string(),
            hooks: vec![
                HookDefinition {
                    name: "on_action".to_string(),
                    event: "action:execute".to_string(),
                    priority: 100,
                },
            ],
            permissions: vec!["file:read".to_string(), "clipboard".to_string()],
            config_schema: None,
            dependencies: vec![],
        }
    }
}
