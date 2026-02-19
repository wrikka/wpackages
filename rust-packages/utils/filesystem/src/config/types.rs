//! Configuration types.
//!
//! This module contains the main configuration type that aggregates
//! all configuration sections.

use figment::{
    providers::{Env, Format, Toml},
    Figment,
};
use serde::{Deserialize, Serialize};

use super::app::AppConfig;
use super::logging::LoggingConfig;
use super::navigation::NavigationConfig;
use super::operations::OperationsConfig;
use super::search::SearchConfig;
use super::watcher::WatcherConfig;
use super::performance::PerformanceConfig;
use super::constants::{DEFAULT_CONFIG_FILENAME, ENV_PREFIX};
use crate::error::{FsError, FsResult};

/// Global configuration for `filesystem`.
///
/// This struct represents the complete runtime configuration,
/// loaded from TOML files and environment variables.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FilesystemConfig {
    /// Application settings.
    #[serde(default)]
    pub app: AppConfig,

    /// Logging configuration.
    #[serde(default)]
    pub logging: LoggingConfig,

    /// Performance settings.
    #[serde(default)]
    pub performance: PerformanceConfig,

    /// Navigation configuration.
    #[serde(default)]
    pub navigation: NavigationConfig,

    /// Search configuration.
    #[serde(default)]
    pub search: SearchConfig,

    /// Operations configuration.
    #[serde(default)]
    pub operations: OperationsConfig,

    /// Watcher configuration.
    #[serde(default)]
    pub watcher: WatcherConfig,
}

impl Default for FilesystemConfig {
    fn default() -> Self {
        Self {
            app: AppConfig::default(),
            logging: LoggingConfig::default(),
            performance: PerformanceConfig::default(),
            navigation: NavigationConfig::default(),
            search: SearchConfig::default(),
            operations: OperationsConfig::default(),
            watcher: WatcherConfig::default(),
        }
    }
}

impl FilesystemConfig {
    /// Load configuration from default sources.
    ///
    /// Configuration is loaded in the following priority (highest first):
    /// 1. Environment variables (FILESYSTEM_*)
    /// 2. Config.toml file
    /// 3. Default values
    ///
    /// # Errors
    ///
    /// Returns an error if the configuration file exists but cannot be parsed.
    pub fn load() -> FsResult<Self> {
        Self::load_from(DEFAULT_CONFIG_FILENAME)
    }

    /// Load configuration from a specific file path.
    ///
    /// # Errors
    ///
    /// Returns an error if the configuration file cannot be read or parsed.
    pub fn load_from(path: impl AsRef<std::path::Path>) -> FsResult<Self> {
        let figment = Figment::new()
            .merge(Toml::file(path.as_ref()))
            .merge(Env::prefixed(ENV_PREFIX).split("__"));

        figment
            .extract()
            .map_err(|e| FsError::validation(format!("Failed to load config: {e}")))
    }

    /// Create a new configuration with default values.
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    /// Validate configuration.
    ///
    /// # Errors
    ///
    /// Returns an error if any configuration values are invalid.
    pub fn validate(&self) -> FsResult<()> {
        // Validate buffer size
        if self.performance.buffer_size == 0 {
            return Err(FsError::validation("Buffer size must be greater than 0"));
        }

        // Validate navigation depth
        if self.navigation.max_depth == 0 {
            return Err(FsError::validation("Navigation depth must be greater than 0"));
        }

        // Validate search configuration
        if self.search.enabled && self.search.max_results == 0 {
            return Err(FsError::validation("Search max results must be greater than 0"));
        }

        // Validate operations configuration
        if self.operations.max_parallel_ops.value() == 0 {
            return Err(FsError::validation("Max parallel operations must be greater than 0"));
        }

        Ok(())
    }
}
