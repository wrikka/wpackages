use crate::app::api::ConfigApi;
use crate::app::pty_app::PtyApp;
use crate::types::{Command, Keybinding, Theme, TriggerSpec};
use async_trait::async_trait;

#[async_trait]
impl ConfigApi for PtyApp {
    async fn get_keybindings(&self) -> Option<Vec<Keybinding>> {
        self.config_service.get_config().await.keybindings.clone()
    }

    async fn get_theme(&self) -> Option<Theme> {
        self.config_service.get_config().await.theme.clone()
    }

    async fn get_commands(&self) -> Vec<Command> {
        self.command_service.list_commands().await
    }

    async fn get_enable_ligatures(&self) -> Option<bool> {
        self.config_service.get_config().await.enable_ligatures
    }

    async fn get_copy_on_select(&self) -> Option<bool> {
        self.config_service.get_config().await.copy_on_select
    }

    async fn get_triggers(&self) -> Option<Vec<TriggerSpec>> {
        self.config_service.get_config().await.triggers.clone()
    }
}
