use crate::error::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginManifest {
    pub name: String,
    pub version: String,
    pub description: String,
    pub author: String,
    pub entry_point: String,
    pub dependencies: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct Plugin {
    pub manifest: PluginManifest,
    pub path: PathBuf,
    pub enabled: bool,
}

#[derive(Debug, Clone)]
pub enum PluginEvent {
    EditorReady,
    FileOpened(String),
    FileSaved(String),
    FileClosed(String),
    CursorMoved { line: usize, col: usize },
    ModeChanged(String),
    CommandExecuted(String),
}

pub type PluginEventHandler = Box<dyn Fn(PluginEvent) -> Result<()> + Send + Sync>;

pub struct PluginCommand {
    pub name: String,
    pub description: String,
    pub handler: Arc<dyn Fn(Vec<String>) -> Result<String> + Send + Sync>,
}

pub struct PluginSystem {
    plugins: Vec<Plugin>,
    event_handlers: HashMap<String, Vec<PluginEventHandler>>,
    commands: HashMap<String, PluginCommand>,
}

impl PluginSystem {
    pub fn new() -> Self {
        Self {
            plugins: Vec::new(),
            event_handlers: HashMap::new(),
            commands: HashMap::new(),
        }
    }

    pub fn load_plugin(&mut self, path: PathBuf) -> Result<Plugin> {
        let manifest_path = path.join("plugin.toml");

        if !manifest_path.exists() {
            return Err(crate::error::AppError::Plugin(format!(
                "Plugin manifest not found: {}",
                manifest_path.display()
            )));
        }

        let manifest_content = std::fs::read_to_string(&manifest_path)?;
        let manifest: PluginManifest = toml::from_str(&manifest_content).map_err(|e| {
            crate::error::AppError::Plugin(format!("Failed to parse manifest: {}", e))
        })?;

        let plugin = Plugin {
            manifest,
            path,
            enabled: true,
        };

        self.plugins.push(plugin.clone());
        Ok(plugin)
    }

    pub fn unload_plugin(&mut self, name: &str) -> Result<()> {
        if let Some(pos) = self.plugins.iter().position(|p| p.manifest.name == name) {
            self.plugins.remove(pos);
            self.event_handlers.remove(name);
            self.commands
                .retain(|_, cmd| !cmd.name.starts_with(&format!("{}:", name)));
            Ok(())
        } else {
            Err(crate::error::AppError::Plugin(format!(
                "Plugin not found: {}",
                name
            )))
        }
    }

    pub fn enable_plugin(&mut self, name: &str) -> Result<()> {
        if let Some(plugin) = self.plugins.iter_mut().find(|p| p.manifest.name == name) {
            plugin.enabled = true;
            Ok(())
        } else {
            Err(crate::error::AppError::Plugin(format!(
                "Plugin not found: {}",
                name
            )))
        }
    }

    pub fn disable_plugin(&mut self, name: &str) -> Result<()> {
        if let Some(plugin) = self.plugins.iter_mut().find(|p| p.manifest.name == name) {
            plugin.enabled = false;
            Ok(())
        } else {
            Err(crate::error::AppError::Plugin(format!(
                "Plugin not found: {}",
                name
            )))
        }
    }

    pub fn register_event_handler(
        &mut self,
        _plugin_name: String,
        event_type: String,
        handler: PluginEventHandler,
    ) {
        self.event_handlers
            .entry(event_type)
            .or_default()
            .push(handler);
    }

    pub fn emit_event(&self, event: PluginEvent) -> Result<()> {
        let event_type = match &event {
            PluginEvent::EditorReady => "editor_ready".to_string(),
            PluginEvent::FileOpened(_) => "file_opened".to_string(),
            PluginEvent::FileSaved(_) => "file_saved".to_string(),
            PluginEvent::FileClosed(_) => "file_closed".to_string(),
            PluginEvent::CursorMoved { .. } => "cursor_moved".to_string(),
            PluginEvent::ModeChanged(_) => "mode_changed".to_string(),
            PluginEvent::CommandExecuted(_) => "command_executed".to_string(),
        };

        if let Some(handlers) = self.event_handlers.get(&event_type) {
            for handler in handlers {
                handler(event.clone())?;
            }
        }

        Ok(())
    }

    pub fn register_command(&mut self, command: PluginCommand) {
        self.commands.insert(command.name.clone(), command);
    }

    pub fn execute_command(&self, name: &str, args: Vec<String>) -> Result<String> {
        if let Some(command) = self.commands.get(name) {
            (command.handler)(args)
        } else {
            Err(crate::error::AppError::Plugin(format!(
                "Command not found: {}",
                name
            )))
        }
    }

    pub fn get_commands(&self) -> Vec<&PluginCommand> {
        self.commands.values().collect()
    }

    pub fn get_plugins(&self) -> &[Plugin] {
        &self.plugins
    }

    pub fn get_plugin(&self, name: &str) -> Option<&Plugin> {
        self.plugins.iter().find(|p| p.manifest.name == name)
    }
}

impl Default for PluginSystem {
    fn default() -> Self {
        Self::new()
    }
}
