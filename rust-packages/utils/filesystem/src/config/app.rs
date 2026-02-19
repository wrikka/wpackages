//! Application configuration.
//!
//! This module contains configuration for the application itself.

use serde::{Deserialize, Serialize};

use super::constants::{
    DEFAULT_APP_DESCRIPTION, DEFAULT_APP_NAME,
};

/// Application configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    /// Application name.
    #[serde(default = "default_app_name")]
    pub name: String,

    /// Application version.
    #[serde(default = "default_app_version")]
    pub version: String,

    /// Application description.
    #[serde(default = "default_app_description")]
    pub description: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            name: default_app_name(),
            version: default_app_version(),
            description: default_app_description(),
        }
    }
}

/// Default application name.
#[must_use]
fn default_app_name() -> String {
    String::from(DEFAULT_APP_NAME)
}

/// Default application version.
#[must_use]
fn default_app_version() -> String {
    std::env::var("CARGO_PKG_VERSION").unwrap_or_else(|_| "0.1.0".to_string())
}

/// Default application description.
#[must_use]
fn default_app_description() -> String {
    String::from(DEFAULT_APP_DESCRIPTION)
}
