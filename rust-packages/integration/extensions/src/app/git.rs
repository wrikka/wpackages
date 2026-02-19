use crate::prelude::*;

#[derive(Default, Clone)]
pub struct GitExtension;

#[async_trait]
impl Extension for GitExtension {
    async fn on_load(&mut self) {}

    async fn on_activate(&mut self, context: ActivationContext) {
        context.commands.register(
            Command {
                id: CommandId::new("git.open_git_view"),
                title: "Open Git".to_string(),
                category: Some("Git".to_string()),
            },
            OpenGitViewHandler,
        );
    }

    async fn on_deactivate(&mut self) {}

    async fn on_unload(&mut self) {}
}

// --- Command Handlers ---

#[derive(Clone)]
struct OpenGitViewHandler;

#[async_trait]
impl CommandHandler for OpenGitViewHandler {
    async fn execute(&self) {
        tracing::info!("Executing 'Open Git View' command");
    }
}
