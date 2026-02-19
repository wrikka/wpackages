// Common imports for plugin-registry library

// Error handling
pub use crate::error::{Error, Result};

// Configuration
pub use crate::config::Config;

// Models
pub use crate::models::{Plugin, PluginVersion, PluginMetadata};

// Services
pub use crate::services::PluginService;

// Async trait
pub use async_trait::async_trait;
