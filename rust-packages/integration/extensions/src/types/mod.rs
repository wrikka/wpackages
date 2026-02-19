//! Core data types for the extension system.

pub mod command;
pub mod context;
pub mod contributions;
pub mod event;
pub mod extension_trait;
pub mod id;
pub mod loaded_extension;
pub mod lsp;
pub mod manifest;
pub mod settings;
pub mod theme;
pub mod tool;
pub mod ui;
pub mod webview;

pub use context::ActivationContext;
pub use extension_trait::Extension;
pub use id::{CommandId, ComponentId, ExtensionId, WebviewId};
pub use loaded_extension::LoadedExtension;
pub use manifest::ExtensionManifest;
pub use tool::{PropertySchema, PropertyType, ToolDefinition, ToolInputSchema};

pub mod api;
pub use api::{ExtensionCommand, ViewId};
