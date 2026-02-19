// Plugin API

use serde::{Deserialize, Serialize};

/// Plugin event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PluginEvent {
    BeforeTask {
        workspace: String,
        task: String,
        hash: String,
    },
    AfterTask {
        workspace: String,
        task: String,
        hash: String,
        success: bool,
    },
    CacheHit {
        workspace: String,
        task: String,
        hash: String,
        source: String,
    },
    CacheMiss {
        workspace: String,
        task: String,
        hash: String,
    },
}

/// Plugin trait
pub trait Plugin: Send + Sync {
    fn name(&self) -> &str;
    fn handle_event(&self, event: &PluginEvent) -> Result<(), Box<dyn std::error::Error>>;
}

/// Plugin manager
pub struct PluginManager {
    plugins: Vec<Box<dyn Plugin>>,
}

impl PluginManager {
    pub fn new() -> Self {
        PluginManager {
            plugins: Vec::new(),
        }
    }

    pub fn register(&mut self, plugin: Box<dyn Plugin>) {
        self.plugins.push(plugin);
    }

    pub async fn emit(&self, event: PluginEvent) {
        for plugin in &self.plugins {
            if let Err(e) = plugin.handle_event(&event) {
                eprintln!("Plugin error: {}", e);
            }
        }
    }
}

impl Default for PluginManager {
    fn default() -> Self {
        Self::new()
    }
}
