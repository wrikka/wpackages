// Common imports for extensions library

// Main entry point
pub use crate::app::manager::ExtensionManager;

// Core types
pub use crate::types::{
    CommandId, ComponentId, Extension, ExtensionId, ExtensionManifest, LoadedExtension, WebviewId,
};

// Public API
pub use crate::types::{
    command::{Command, CommandHandler},
    settings::{SettingSpec, SettingValue},
    ui::{StatusBarItem, UiContributionPoint},
    ActivationContext,
};

// Services
pub use crate::services::{CommandRegistry, PermissionService, SettingsService, UiRegistry};

// Error handling
pub use crate::error::{AppError, Result as ExtensionResult};

// Required traits
pub use async_trait::async_trait;
