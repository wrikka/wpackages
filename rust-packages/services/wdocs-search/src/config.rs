use crate::error::{ConfigError, ConfigResult};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Configuration for the wdocs-search engine
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchConfig {
    /// Maximum number of documents to return in search results
    pub max_results: usize,

    /// Maximum number of suggestions to return
    pub max_suggestions: usize,

    /// Default fuzzy search threshold
    pub default_fuzzy_threshold: u32,

    /// Enable fuzzy search by default
    pub enable_fuzzy_search: bool,

    /// Memory usage limit in bytes
    pub memory_limit_bytes: Option<usize>,

    /// Index file path
    pub index_path: Option<PathBuf>,

    /// Backup directory path
    pub backup_dir: Option<PathBuf>,

    /// Enable persistence
    pub enable_persistence: bool,

    /// Log level
    pub log_level: String,

    /// Enable debug mode
    pub debug: bool,
}

impl Default for SearchConfig {
    fn default() -> Self {
        Self {
            max_results: 100,
            max_suggestions: 10,
            default_fuzzy_threshold: 2,
            enable_fuzzy_search: false,
            memory_limit_bytes: Some(1024 * 1024 * 1024), // 1GB
            index_path: None,
            backup_dir: None,
            enable_persistence: true,
            log_level: "info".to_string(),
            debug: false,
        }
    }
}

impl SearchConfig {
    /// Load configuration from environment variables
    pub fn from_env() -> ConfigResult<Self> {
        let mut config = Self::default();

        // Override with environment variables if present
        if let Ok(max_results) = std::env::var("WDOCS_MAX_RESULTS") {
            config.max_results = max_results.parse().map_err(|e| {
                ConfigError::InvalidConfig(format!("Invalid WDOCS_MAX_RESULTS: {}", e))
            })?;
        }

        if let Ok(max_suggestions) = std::env::var("WDOCS_MAX_SUGGESTIONS") {
            config.max_suggestions = max_suggestions.parse().map_err(|e| {
                ConfigError::InvalidConfig(format!("Invalid WDOCS_MAX_SUGGESTIONS: {}", e))
            })?;
        }

        if let Ok(fuzzy_threshold) = std::env::var("WDOCS_FUZZY_THRESHOLD") {
            config.default_fuzzy_threshold = fuzzy_threshold.parse().map_err(|e| {
                ConfigError::InvalidConfig(format!("Invalid WDOCS_FUZZY_THRESHOLD: {}", e))
            })?;
        }

        if let Ok(enable_fuzzy) = std::env::var("WDOCS_ENABLE_FUZZY") {
            config.enable_fuzzy_search = enable_fuzzy.parse().map_err(|e| {
                ConfigError::InvalidConfig(format!("Invalid WDOCS_ENABLE_FUZZY: {}", e))
            })?;
        }

        if let Ok(memory_limit) = std::env::var("WDOCS_MEMORY_LIMIT") {
            config.memory_limit_bytes = Some(memory_limit.parse().map_err(|e| {
                ConfigError::InvalidConfig(format!("Invalid WDOCS_MEMORY_LIMIT: {}", e))
            })?);
        }

        if let Ok(index_path) = std::env::var("WDOCS_INDEX_PATH") {
            config.index_path = Some(PathBuf::from(index_path));
        }

        if let Ok(backup_dir) = std::env::var("WDOCS_BACKUP_DIR") {
            config.backup_dir = Some(PathBuf::from(backup_dir));
        }

        if let Ok(enable_persistence) = std::env::var("WDOCS_ENABLE_PERSISTENCE") {
            config.enable_persistence = enable_persistence.parse().map_err(|e| {
                ConfigError::InvalidConfig(format!("Invalid WDOCS_ENABLE_PERSISTENCE: {}", e))
            })?;
        }

        if let Ok(log_level) = std::env::var("WDOCS_LOG_LEVEL") {
            config.log_level = log_level;
        }

        if let Ok(debug) = std::env::var("WDOCS_DEBUG") {
            config.debug = debug
                .parse()
                .map_err(|e| ConfigError::InvalidConfig(format!("Invalid WDOCS_DEBUG: {}", e)))?;
        }

        Ok(config)
    }

    /// Load configuration from a TOML file
    pub fn from_file<P: AsRef<std::path::Path>>(path: P) -> ConfigResult<Self> {
        let content = std::fs::read_to_string(path).map_err(|e| {
            ConfigError::ConfigNotFound(format!("Failed to read config file: {}", e))
        })?;

        let config: Self = toml::from_str(&content).map_err(|e| ConfigError::ParseError(e))?;

        Ok(config)
    }

    /// Save configuration to a TOML file
    pub fn save_to_file<P: AsRef<std::path::Path>>(&self, path: P) -> ConfigResult<()> {
        let content = toml::to_string_pretty(self).map_err(|e| ConfigError::ParseError(e))?;

        std::fs::write(path, content)
            .map_err(|e| ConfigError::IoError(std::io::Error::new(std::io::ErrorKind::Other, e)))?;

        Ok(())
    }

    /// Validate configuration
    pub fn validate(&self) -> ConfigResult<()> {
        if self.max_results == 0 {
            return Err(ConfigError::InvalidConfig(
                "max_results must be greater than 0".to_string(),
            ));
        }

        if self.max_suggestions == 0 {
            return Err(ConfigError::InvalidConfig(
                "max_suggestions must be greater than 0".to_string(),
            ));
        }

        if self.default_fuzzy_threshold == 0 {
            return Err(ConfigError::InvalidConfig(
                "default_fuzzy_threshold must be greater than 0".to_string(),
            ));
        }

        if let Some(memory_limit) = self.memory_limit_bytes {
            if memory_limit == 0 {
                return Err(ConfigError::InvalidConfig(
                    "memory_limit_bytes must be greater than 0".to_string(),
                ));
            }
        }

        Ok(())
    }

    /// Get memory limit in bytes
    pub fn memory_limit(&self) -> usize {
        self.memory_limit_bytes.unwrap_or(usize::MAX)
    }

    /// Check if persistence is enabled
    pub fn is_persistence_enabled(&self) -> bool {
        self.enable_persistence && self.index_path.is_some()
    }

    /// Get index path
    pub fn get_index_path(&self) -> Option<&PathBuf> {
        self.index_path.as_ref()
    }

    /// Get backup directory
    pub fn get_backup_dir(&self) -> Option<&PathBuf> {
        self.backup_dir.as_ref()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = SearchConfig::default();
        assert_eq!(config.max_results, 100);
        assert_eq!(config.max_suggestions, 10);
        assert_eq!(config.default_fuzzy_threshold, 2);
        assert!(!config.enable_fuzzy_search);
        assert!(config.enable_persistence);
    }

    #[test]
    fn test_config_validation() {
        let mut config = SearchConfig::default();

        // Valid config should pass
        assert!(config.validate().is_ok());

        // Invalid max_results
        config.max_results = 0;
        assert!(config.validate().is_err());

        // Reset to valid
        config.max_results = 100;
        assert!(config.validate().is_ok());
    }

    #[test]
    fn test_config_serialization() {
        let config = SearchConfig::default();
        let serialized = toml::to_string_pretty(&config).unwrap();
        let deserialized: SearchConfig = toml::from_str(&serialized).unwrap();

        assert_eq!(config.max_results, deserialized.max_results);
        assert_eq!(config.max_suggestions, deserialized.max_suggestions);
    }
}
