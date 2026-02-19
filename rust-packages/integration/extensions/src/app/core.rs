use crate::prelude::*;

// This is a stand-in for a real extension.
// In the final version, this would be in its own crate.

#[derive(Default)]
pub struct CoreExtension;

#[async_trait]
impl Extension for CoreExtension {
    async fn on_load(&mut self) {
        // Nothing to do on load for the core extension
    }

    async fn on_activate(&mut self, context: ActivationContext) {
        context.commands.register(
            Command {
                id: CommandId::new("core.open_extensions"),
                title: "Extensions".to_string(),
                category: Some("View".to_string()),
            },
            OpenExtensionsHandler,
        );

        context.commands.register(
            Command {
                id: CommandId::new("core.open_settings"),
                title: "Settings".to_string(),
                category: Some("View".to_string()),
            },
            OpenSettingsHandler,
        );
    }

    async fn on_deactivate(&mut self) {
        // For now, commands are cleared on reload, so nothing to do here.
    }

    async fn on_unload(&mut self) {
        // Nothing to clean up
    }
}

// --- Command Handlers ---

#[derive(Clone)]
struct OpenExtensionsHandler;

#[async_trait]
impl CommandHandler for OpenExtensionsHandler {
    async fn execute(&self) {
        // In a real application, this would send an event to the UI layer
        // to open the extensions view.
        tracing::info!("Executing 'Open Extensions' command");
    }
}

#[derive(Clone)]
struct OpenSettingsHandler;

#[async_trait]
impl CommandHandler for OpenSettingsHandler {
    async fn execute(&self) {
        tracing::info!("Executing 'Open Settings' command");
    }
}
