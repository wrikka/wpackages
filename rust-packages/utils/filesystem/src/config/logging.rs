//! Logging configuration.
//!
//! This module contains configuration for logging and telemetry.

use serde::{Deserialize, Serialize};

use super::constants::{DEFAULT_LOG_FORMAT, DEFAULT_LOG_LEVEL};

/// Logging configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoggingConfig {
    /// Log level (trace, debug, info, warn, error).
    #[serde(default = "default_log_level")]
    pub level: String,

    /// Log format (compact, pretty, json).
    #[serde(default = "default_log_format")]
    pub format: String,
}

impl Default for LoggingConfig {
    fn default() -> Self {
        Self {
            level: default_log_level(),
            format: default_log_format(),
        }
    }
}

/// Default log level.
#[must_use]
fn default_log_level() -> String {
    String::from(DEFAULT_LOG_LEVEL)
}

/// Default log format.
#[must_use]
fn default_log_format() -> String {
    String::from(DEFAULT_LOG_FORMAT)
}
