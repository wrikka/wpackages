use crate::types::ActivationContext;
use async_trait::async_trait;
use std::sync::Arc;

pub type DynExtension = Arc<dyn Extension + Send + Sync>;

/// The main trait that all extensions must implement.
#[async_trait]
pub trait Extension: Send + Sync {
    /// Called when the extension is first loaded.
    async fn on_load(&mut self);

    /// Called when the extension is activated.
    /// This is where the extension should register its commands and other contributions.
    async fn on_activate(&mut self, context: ActivationContext);

    /// Called when the extension is deactivated.
    async fn on_deactivate(&mut self);

    /// Called when the extension is about to be unloaded.
    async fn on_unload(&mut self);
}
