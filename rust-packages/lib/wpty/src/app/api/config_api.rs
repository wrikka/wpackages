use crate::types::{Command, Keybinding, Theme, TriggerSpec};
use async_trait::async_trait;

#[async_trait]
pub trait ConfigApi {
    async fn get_keybindings(&self) -> Option<Vec<Keybinding>>;

    async fn get_theme(&self) -> Option<Theme>;

    async fn get_commands(&self) -> Vec<Command>;

    async fn get_enable_ligatures(&self) -> Option<bool>;

    async fn get_copy_on_select(&self) -> Option<bool>;

    async fn get_triggers(&self) -> Option<Vec<TriggerSpec>>;
}
