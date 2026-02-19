//! Configuration management for `file-ops`.
//!
//! This module handles all configuration loading and validation using `figment`,
//! supporting TOML files, environment variables, and sensible defaults.

use figment::{
    providers::{Env, Format, Toml},
    Figment,
};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

use crate::error::{Error, Result};

/// Default configuration file name.
pub const DEFAULT_CONFIG_FILE: &str = "Config.toml";

/// Environment variable prefix for configuration.
pub const ENV_PREFIX: &str = "FILE_OPS";

/// Global configuration for `file-ops`.
///
/// This struct represents the complete runtime configuration,
/// loaded from TOML files and environment variables.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    /// Application settings.
    #[serde(default)]
    pub app: AppConfig,

    /// Logging configuration.
    #[serde(default)]
    pub log: LogConfig,

    /// File operation settings.
    #[serde(default)]
    pub file: FileConfig,

    /// Batch operation settings.
    #[serde(default)]
    pub batch: BatchConfig,

    /// Cloud storage configuration.
    #[serde(default)]
    pub cloud: CloudConfig,
}

/// Application configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    /// Application name.
    #[serde(default = "default_app_name")]
    pub name: String,

    /// Application version.
    #[serde(default = "default_app_version")]
    pub version: String,

    /// Number of worker threads (0 = auto).
    #[serde(default)]
    pub workers: usize,
}

/// Logging configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogConfig {
    /// Log level (trace, debug, info, warn, error).
    #[serde(default = "default_log_level")]
    pub level: String,

    /// Enable colored output.
    #[serde(default = "default_true")]
    pub colored: bool,

    /// Log format (compact, pretty, json).
    #[serde(default = "default_log_format")]
    pub format: String,
}

/// File operation configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileConfig {
    /// Default buffer size for I/O operations.
    #[serde(default = "default_buffer_size")]
    pub buffer_size: usize,

    /// Enable atomic writes by default.
    #[serde(default = "default_true")]
    pub atomic_writes: bool,

    /// Default temp directory (None = system default).
    pub temp_dir: Option<PathBuf>,

    /// Follow symlinks by default.
    #[serde(default = "default_true")]
    pub follow_symlinks: bool,

    /// Preserve permissions when copying.
    #[serde(default = "default_true")]
    pub preserve_permissions: bool,

    /// Preserve timestamps when copying.
    #[serde(default = "default_true")]
    pub preserve_timestamps: bool,
}

/// Batch operation configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchConfig {
    /// Maximum concurrent operations.
    #[serde(default = "default_max_concurrent")]
    pub max_concurrent: usize,

    /// Enable parallel processing.
    #[serde(default = "default_true")]
    pub parallel: bool,

    /// Chunk size for batch operations.
    #[serde(default = "default_chunk_size")]
    pub chunk_size: usize,
}

/// Cloud storage configuration.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CloudConfig {
    /// Enable cloud storage features.
    #[serde(default)]
    pub enabled: bool,

    /// Default timeout for cloud operations.
    #[serde(default = "default_timeout_seconds")]
    pub timeout_seconds: u64,

    /// S3 configuration.
    #[serde(default)]
    pub s3: Option<S3Config>,

    /// GCS configuration.
    #[serde(default)]
    pub gcs: Option<GcsConfig>,

    /// Azure configuration.
    #[serde(default)]
    pub azure: Option<AzureConfig>,
}

/// S3 storage configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct S3Config {
    /// S3 bucket name.
    pub bucket: String,

    /// S3 region.
    #[serde(default = "default_s3_region")]
    pub region: String,

    /// Optional endpoint URL (for MinIO, etc.).
    pub endpoint: Option<String>,
}

/// Google Cloud Storage configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GcsConfig {
    /// GCS bucket name.
    pub bucket: String,

    /// Project ID.
    pub project_id: Option<String>,
}

/// Azure Blob Storage configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AzureConfig {
    /// Azure storage account.
    pub account: String,

    /// Azure container name.
    pub container: String,
}

// Default value functions
#[must_use]
fn default_app_name() -> String {
    String::from("file-ops")
}

#[must_use]
fn default_app_version() -> String {
    String::from(env!("CARGO_PKG_VERSION"))
}

#[must_use]
fn default_log_level() -> String {
    String::from("info")
}

#[must_use]
fn default_log_format() -> String {
    String::from("compact")
}

#[must_use]
fn default_buffer_size() -> usize {
    8192 // 8KB
}

#[must_use]
fn default_max_concurrent() -> usize {
    num_cpus::get()
}

#[must_use]
fn default_chunk_size() -> usize {
    100
}

#[must_use]
fn default_timeout_seconds() -> u64 {
    30
}

#[must_use]
fn default_s3_region() -> String {
    String::from("us-east-1")
}

#[must_use]
const fn default_true() -> bool {
    true
}

impl Default for Config {
    fn default() -> Self {
        Self {
            app: AppConfig::default(),
            log: LogConfig::default(),
            file: FileConfig::default(),
            batch: BatchConfig::default(),
            cloud: CloudConfig::default(),
        }
    }
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            name: default_app_name(),
            version: default_app_version(),
            workers: 0,
        }
    }
}

impl Default for LogConfig {
    fn default() -> Self {
        Self {
            level: default_log_level(),
            colored: true,
            format: default_log_format(),
        }
    }
}

impl Default for FileConfig {
    fn default() -> Self {
        Self {
            buffer_size: default_buffer_size(),
            atomic_writes: true,
            temp_dir: None,
            follow_symlinks: true,
            preserve_permissions: true,
            preserve_timestamps: true,
        }
    }
}

impl Default for BatchConfig {
    fn default() -> Self {
        Self {
            max_concurrent: default_max_concurrent(),
            parallel: true,
            chunk_size: default_chunk_size(),
        }
    }
}

impl Config {
    /// Load configuration from default sources.
    ///
    /// Configuration is loaded in the following priority (highest first):
    /// 1. Environment variables (FILE_OPS_*)
    /// 2. Config.toml file
    /// 3. Default values
    ///
    /// # Errors
    ///
    /// Returns an error if the configuration file exists but cannot be parsed.
    pub fn load() -> Result<Self> {
        Self::load_from(DEFAULT_CONFIG_FILE)
    }

    /// Load configuration from a specific file path.
    ///
    /// # Errors
    ///
    /// Returns an error if the configuration file cannot be read or parsed.
    pub fn load_from(path: impl AsRef<std::path::Path>) -> Result<Self> {
        let figment = Figment::new()
            .merge(Toml::file(path.as_ref()))
            .merge(Env::prefixed(ENV_PREFIX).split("__"));

        figment
            .extract()
            .map_err(|e| Error::validation(format!("Failed to load config: {e}")))
    }

    /// Create a new configuration with default values.
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    /// Validate the configuration.
    ///
    /// # Errors
    ///
    /// Returns an error if any configuration values are invalid.
    pub fn validate(&self) -> Result<()> {
        // Validate buffer size
        if self.file.buffer_size == 0 {
            return Err(Error::validation("Buffer size must be greater than 0"));
        }

        // Validate batch configuration
        if self.batch.chunk_size == 0 {
            return Err(Error::validation("Chunk size must be greater than 0"));
        }

        // Validate cloud configuration
        if self.cloud.enabled && self.cloud.timeout_seconds == 0 {
            return Err(Error::validation("Cloud timeout must be greater than 0"));
        }

        Ok(())
    }
}
