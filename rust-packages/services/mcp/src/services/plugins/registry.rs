use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio::sync::RwLock;
use tracing::{debug, info};

use super::loader::PluginMetadata;

pub struct PluginInstance {
    pub metadata: PluginMetadata,
    pub state: Arc<RwLock<PluginState>>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PluginState {
    Loaded,
    Active,
    Inactive,
    Error,
}

pub struct PluginRegistry {
    plugins: Arc<RwLock<HashMap<String, PluginInstance>>>,
}

impl PluginRegistry {
    pub fn new() -> Self {
        Self {
            plugins: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn register(&self, metadata: PluginMetadata) {
        let name = metadata.name.clone();
        let instance = PluginInstance {
            metadata,
            state: Arc::new(RwLock::new(PluginState::Loaded)),
        };

        let mut plugins = self.plugins.write().await;
        plugins.insert(name.clone(), instance);

        info!("Plugin '{}' registered in registry", name);
    }

    pub async fn unregister(&self, name: &str) -> Result<(), String> {
        let mut plugins = self.plugins.write().await;

        if plugins.remove(name).is_some() {
            info!("Plugin '{}' unregistered from registry", name);
            Ok(())
        } else {
            Err(format!("Plugin not found: {}", name))
        }
    }

    pub async fn get_plugin(&self, name: &str) -> Option<PluginMetadata> {
        let plugins = self.plugins.read().await;
        plugins.get(name).map(|p| p.metadata.clone())
    }

    pub async fn list_plugins(&self) -> Vec<PluginMetadata> {
        let plugins = self.plugins.read().await;
        plugins.values().map(|p| p.metadata.clone()).collect()
    }

    pub async fn set_plugin_state(&self, name: &str, state: PluginState) -> Result<(), String> {
        let mut plugins = self.plugins.write().await;

        if let Some(plugin) = plugins.get_mut(name) {
            *plugin.state.write().await = state;
            debug!("Plugin '{}' state set to {:?}", name, state);
            Ok(())
        } else {
            Err(format!("Plugin not found: {}", name))
        }
    }

    pub async fn get_plugin_state(&self, name: &str) -> Option<PluginState> {
        let plugins = self.plugins.read().await;
        if let Some(p) = plugins.get(name) {
            Some(*p.state.read().await)
        } else {
            None
        }
    }
}
