//! # Application Configuration
//!
//! This module defines the configuration structure for the application, loaded
//! from `Config.toml` and environment variables using `figment`.

use crate::error::Result;
use figment::{
    providers::{Env, Format, Toml},
    Figment,
};
use serde::{Deserialize, Serialize};

/// Main application configuration
#[derive(Debug, Deserialize, Serialize)]
pub struct AppConfig {
    pub app: App,
    pub logging: Logging,
    pub ai: AI,
}

/// General application settings
#[derive(Debug, Deserialize, Serialize)]
pub struct App {
    pub name: String,
    pub version: String,
}

/// Logging settings
#[derive(Debug, Deserialize, Serialize)]
pub struct Logging {
    pub level: String,
}

/// AI service settings
#[derive(Debug, Deserialize, Serialize)]
pub struct AI {
    pub provider: String,
    pub api_key: Option<String>,
}

impl AppConfig {
    /// Load configuration from `Config.toml` and environment variables.
    ///
    /// Environment variables are prefixed with `APP_` and use `__` as a separator.
    /// For example, `APP_LOGGING__LEVEL=debug` overrides the logging level.
    pub fn load() -> Result<Self> {
        Figment::new()
            .merge(Toml::file("Config.toml"))
            .merge(Env::prefixed("APP_").split("__"))
            .extract()
            .map_err(crate::error::AppError::Config)
    }
}
