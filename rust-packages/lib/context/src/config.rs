//! Configuration management for Context Suite
//!
//! This module provides configuration loading and management using the `figment` crate.
//! Configuration can be loaded from multiple sources:
//! - TOML files (Config.toml)
//! - Environment variables
//! - Default values

use figment::{Figment, providers::{Env, Toml}};
use serde::{Deserialize, Serialize};

/// Main configuration structure for the context suite
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    /// Project analysis settings
    pub analysis: AnalysisConfig,
    /// File watching settings
    pub watcher: WatcherConfig,
    /// Logging configuration
    pub logging: LoggingConfig,
}

/// Analysis configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisConfig {
    /// Maximum file size to analyze (in bytes)
    pub max_file_size: usize,
    /// File patterns to ignore
    pub ignore_patterns: Vec<String>,
    /// Enable incremental parsing
    pub incremental_parsing: bool,
    /// Cache directory for analysis results
    pub cache_dir: Option<String>,
}

/// File watcher configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WatcherConfig {
    /// Enable file watching
    pub enabled: bool,
    /// Poll interval in milliseconds
    pub poll_interval_ms: u64,
    /// Debounce delay in milliseconds
    pub debounce_delay_ms: u64,
}

/// Logging configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoggingConfig {
    /// Log level (trace, debug, info, warn, error)
    pub level: String,
    /// Enable file logging
    pub file_logging: bool,
    /// Log file path
    pub file_path: Option<String>,
    /// Enable ANSI colors
    pub ansi_colors: bool,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            analysis: AnalysisConfig::default(),
            watcher: WatcherConfig::default(),
            logging: LoggingConfig::default(),
        }
    }
}

impl Default for AnalysisConfig {
    fn default() -> Self {
        Self {
            max_file_size: 10 * 1024 * 1024, // 10MB
            ignore_patterns: vec![
                "*.tmp".to_string(),
                "*.log".to_string(),
                "node_modules".to_string(),
                "target".to_string(),
                ".git".to_string(),
            ],
            incremental_parsing: true,
            cache_dir: None,
        }
    }
}

impl Default for WatcherConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            poll_interval_ms: 100,
            debounce_delay_ms: 500,
        }
    }
}

impl Default for LoggingConfig {
    fn default() -> Self {
        Self {
            level: "info".to_string(),
            file_logging: false,
            file_path: None,
            ansi_colors: true,
        }
    }
}

/// Load configuration from multiple sources
///
/// # Errors
///
/// Returns an error if configuration loading fails
pub fn load_config() -> Result<Config, figment::Error> {
    Figment::new()
        .merge(Toml::file("Config.toml"))
        .merge(Env::prefixed("CONTEXT_"))
        .extract()
}

/// Load configuration from a specific file
///
/// # Arguments
///
/// * `file_path` - Path to the configuration file
///
/// # Errors
///
/// Returns an error if configuration loading fails
pub fn load_config_from_file(file_path: &str) -> Result<Config, figment::Error> {
    Figment::new()
        .merge(Toml::file(file_path))
        .merge(Env::prefixed("CONTEXT_"))
        .extract()
}

/// Create configuration with default values
pub fn default_config() -> Config {
    Config::default()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = Config::default();
        assert_eq!(config.analysis.max_file_size, 10 * 1024 * 1024);
        assert!(config.analysis.incremental_parsing);
        assert_eq!(config.watcher.poll_interval_ms, 100);
        assert_eq!(config.logging.level, "info");
    }

    #[test]
    fn test_config_serialization() {
        let config = Config::default();
        let json = serde_json::to_string(&config).unwrap();
        let _deserialized: Config = serde_json::from_str(&json).unwrap();
    }
}
