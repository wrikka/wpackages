//! File service for configuration management
//!
//! Service for reading and writing configuration files.

use std::path::{Path, PathBuf};

use super::super::error::{ConfigError, ConfigResult};
use super::super::types::{AppConfig, ConfigFormat};
use super::super::components::serialize_config;

/// File service for configuration operations.
pub struct FileService;

impl FileService {
    /// Reads configuration from a file.
    ///
    /// # Arguments
    ///
    /// * `path` - The path to the configuration file
    ///
    /// # Returns
    ///
    /// Returns the loaded configuration.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::services::file_service::FileService;
    /// use std::path::Path;
    ///
    /// let config = FileService::read_config(Path::new("Config.toml")).unwrap();
    /// ```
    pub fn read_config<P: AsRef<Path>>(path: P) -> ConfigResult<AppConfig> {
        let path = path.as_ref();
        if !path.exists() {
            return Err(ConfigError::NotFound(path.display().to_string()));
        }

        let content = std::fs::read_to_string(path)?;

        let format = if path.extension().and_then(|s| s.to_str()) == Some("json") {
            ConfigFormat::Json
        } else if path.extension().and_then(|s| s.to_str()) == Some("yaml") || path.extension().and_then(|s| s.to_str()) == Some("yml") {
            ConfigFormat::Yaml
        } else {
            ConfigFormat::Toml
        };

        match format {
            ConfigFormat::Toml => toml::from_str(&content)
                .map_err(|e| ConfigError::ParseError(e.to_string())),
            ConfigFormat::Json => serde_json::from_str(&content)
                .map_err(|e| ConfigError::ParseError(e.to_string())),
            ConfigFormat::Yaml => serde_yaml::from_str(&content)
                .map_err(|e| ConfigError::ParseError(e.to_string())),
        }
    }

    /// Writes configuration to a file.
    ///
    /// # Arguments
    ///
    /// * `config` - The configuration to write
    /// * `path` - The path to write to
    /// * `format` - The format to use
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::services::file_service::FileService;
    /// use config::types::{AppConfig, ConfigFormat};
    ///
    /// let config = AppConfig::default();
    /// FileService::write_config(&config, "Config.toml", ConfigFormat::Toml).unwrap();
    /// ```
    pub fn write_config<P: AsRef<Path>>(
        config: &AppConfig,
        path: P,
        format: ConfigFormat,
    ) -> ConfigResult<()> {
        let path = path.as_ref();

        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        let content = serialize_config(config, format)?;
        std::fs::write(path, content)?;

        Ok(())
    }

    /// Checks if a configuration file exists.
    ///
    /// # Arguments
    ///
    /// * `path` - The path to check
    ///
    /// # Returns
    ///
    /// Returns `true` if the file exists, `false` otherwise.
    pub fn exists<P: AsRef<Path>>(path: P) -> bool {
        path.as_ref().exists()
    }

    /// Deletes a configuration file.
    ///
    /// # Arguments
    ///
    /// * `path` - The path to delete
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::services::file_service::FileService;
    ///
    /// FileService::delete_config("old_config.toml").unwrap();
    /// ```
    pub fn delete_config<P: AsRef<Path>>(path: P) -> ConfigResult<()> {
        let path = path.as_ref();
        if !path.exists() {
            return Err(ConfigError::NotFound(path.display().to_string()));
        }

        std::fs::remove_file(path)?;
        Ok(())
    }

    /// Gets the default configuration file path.
    ///
    /// # Returns
    ///
    /// Returns the default path as a `PathBuf`.
    pub fn default_path() -> PathBuf {
        PathBuf::from("Config.toml")
    }
}
