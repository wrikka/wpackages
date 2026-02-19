use crate::application::services::rag_service::RagService;
use crate::error::RagResult;
use crate::plugins::{Plugin, PluginManager};
use std::sync::Arc;

pub struct PluginService {
    plugin_manager: PluginManager,
}

impl PluginService {
    pub fn new() -> Self {
        Self { plugin_manager: PluginManager::new() }
    }

    pub fn register_plugin(&mut self, plugin: Box<dyn Plugin>) {
        self.plugin_manager.register(plugin);
    }

    pub fn on_load_all(&self, service: Arc<RagService>) -> RagResult<()> {
        self.plugin_manager.on_load_all(service)
    }
}
