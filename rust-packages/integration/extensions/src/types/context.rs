use crate::services::{CommandRegistry, SettingsService, UiRegistry};

/// Context provided to an extension during its activation.
/// This contains handles to various wterminal services that the extension can use.
#[derive(Clone)]
pub struct ActivationContext {
    pub commands: CommandRegistry,
    pub ui: UiRegistry,
    pub settings: SettingsService,
}
