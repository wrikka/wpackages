//! Configuration module.
//!
//! This module provides configuration management with separate files for
//! different configuration sections following single responsibility principle.

pub mod app;
pub mod constants;
pub mod logging;
pub mod navigation;
pub mod operations;
pub mod search;
pub mod types;
pub mod utils;
pub mod watcher;
pub mod performance;

// Re-export main types for convenience
pub use types::FilesystemConfig;
pub use constants::{DEFAULT_CONFIG_FILENAME, ENV_PREFIX};
