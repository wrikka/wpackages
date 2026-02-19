// Re-export types
pub use crate::types::{AppConfig, ConfigFormat};

// Config I/O operations
mod config_io;

// Config validation and migration
mod config_validation;

// Custom properties management
mod config_properties;

// Profile management
mod profile_management;
pub use profile_management::ConfigManager;
