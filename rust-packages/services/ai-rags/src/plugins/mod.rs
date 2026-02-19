use crate::application::services::rag_service::RagService;
use crate::error::RagResult;
use std::sync::Arc;

pub trait Plugin: Send + Sync {
    fn name(&self) -> &str;
    fn on_load(&self, service: Arc<RagService>) -> RagResult<()>;
}

pub struct PluginManager {
    plugins: Vec<Box<dyn Plugin>>,
}

impl PluginManager {
    pub fn new() -> Self {
        Self { plugins: vec![] }
    }

    pub fn register(&mut self, plugin: Box<dyn Plugin>) {
        self.plugins.push(plugin);
    }

    pub fn on_load_all(&self, service: Arc<RagService>) -> RagResult<()> {
        for plugin in &self.plugins {
            plugin.on_load(service.clone())?;
        }
        Ok(())
    }
}
