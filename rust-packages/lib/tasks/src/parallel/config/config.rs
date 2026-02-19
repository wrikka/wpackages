//! Configuration for parallel operations

use figment::{Figment, providers::{Env, Format, Serialized, Toml}};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Configuration for parallel operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParallelConfig {
    /// Maximum number of concurrent tasks
    #[serde(default = "default_max_concurrency")]
    pub max_concurrency: usize,
    
    /// Maximum queue size for pending tasks
    #[serde(default = "default_queue_size")]
    pub queue_size: usize,
    
    /// Default timeout for tasks in seconds
    #[serde(default = "default_timeout")]
    pub timeout_secs: u64,
    
    /// Enable progress tracking by default
    #[serde(default = "default_enable_progress")]
    pub enable_progress: bool,
    
    /// Enable cancellation support
    #[serde(default = "default_enable_cancellation")]
    pub enable_cancellation: bool,
}

impl Default for ParallelConfig {
    fn default() -> Self {
        Self {
            max_concurrency: default_max_concurrency(),
            queue_size: default_queue_size(),
            timeout_secs: default_timeout(),
            enable_progress: default_enable_progress(),
            enable_cancellation: default_enable_cancellation(),
        }
    }
}

fn default_max_concurrency() -> usize {
    4
}

fn default_queue_size() -> usize {
    100
}

fn default_timeout() -> u64 {
    60
}

fn default_enable_progress() -> bool {
    true
}

fn default_enable_cancellation() -> bool {
    true
}

impl ParallelConfig {
    /// Load configuration from multiple sources
    ///
    /// Priority (highest to lowest):
    /// 1. Environment variables (PARALLEL_*)
    /// 2. Config.toml file
    /// 3. Default values
    pub fn load() -> Result<Self, crate::error::ParallelError> {
        let config: Self = Figment::new()
            .merge(Toml::file("Config.toml"))
            .merge(Env::prefixed("PARALLEL_"))
            .extract()?;
        
        Ok(config)
    }

    /// Load configuration from a specific file
    pub fn from_file(path: impl AsRef<std::path::Path>) -> Result<Self, crate::error::ParallelError> {
        let config: Self = Figment::new()
            .merge(Toml::file(path))
            .extract()?;
        
        Ok(config)
    }

    /// Create configuration with custom values
    pub fn builder() -> ConfigBuilder {
        ConfigBuilder::new()
    }
}

/// Builder for ParallelConfig
pub struct ConfigBuilder {
    config: ParallelConfig,
}

impl ConfigBuilder {
    fn new() -> Self {
        Self {
            config: ParallelConfig::default(),
        }
    }

    /// Set max concurrency
    pub fn max_concurrency(mut self, value: usize) -> Self {
        self.config.max_concurrency = value;
        self
    }

    /// Set queue size
    pub fn queue_size(mut self, value: usize) -> Self {
        self.config.queue_size = value;
        self
    }

    /// Set timeout in seconds
    pub fn timeout_secs(mut self, value: u64) -> Self {
        self.config.timeout_secs = value;
        self
    }

    /// Enable progress tracking
    pub fn enable_progress(mut self, value: bool) -> Self {
        self.config.enable_progress = value;
        self
    }

    /// Enable cancellation support
    pub fn enable_cancellation(mut self, value: bool) -> Self {
        self.config.enable_cancellation = value;
        self
    }

    /// Build the configuration
    pub fn build(self) -> ParallelConfig {
        self.config
    }
}

impl Default for ConfigBuilder {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = ParallelConfig::default();
        assert_eq!(config.max_concurrency, 4);
        assert_eq!(config.queue_size, 100);
        assert_eq!(config.timeout_secs, 60);
        assert!(config.enable_progress);
        assert!(config.enable_cancellation);
    }

    #[test]
    fn test_config_builder() {
        let config = ParallelConfig::builder()
            .max_concurrency(8)
            .queue_size(200)
            .timeout_secs(120)
            .build();
        
        assert_eq!(config.max_concurrency, 8);
        assert_eq!(config.queue_size, 200);
        assert_eq!(config.timeout_secs, 120);
    }
}
