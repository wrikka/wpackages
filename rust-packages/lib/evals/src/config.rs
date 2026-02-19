//! Configuration management for the evaluation framework

use figment::{providers::{Env, Format, Toml}, Figment};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Main configuration structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    /// Evaluation settings
    pub evaluation: EvaluationConfig,
    /// Model settings
    pub model: ModelConfig,
    /// Metrics settings
    pub metrics: MetricsConfig,
    /// Logging settings
    pub logging: LoggingConfig,
}

/// Evaluation-specific configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvaluationConfig {
    /// Default timeout in milliseconds
    pub default_timeout_ms: u64,
    /// Maximum concurrent evaluations
    pub max_concurrent_evaluations: usize,
    /// Results directory
    pub results_dir: PathBuf,
    /// Cache directory
    pub cache_dir: PathBuf,
}

/// Model configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelConfig {
    /// Default model name
    pub default_model: String,
    /// API endpoint
    pub api_endpoint: String,
    /// API key (should be loaded from environment)
    #[serde(skip_serializing)]
    pub api_key: Option<String>,
    /// Request timeout in milliseconds
    pub request_timeout_ms: u64,
    /// Maximum retries
    pub max_retries: u32,
}

/// Metrics configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricsConfig {
    /// Enable detailed metrics collection
    pub enable_detailed_metrics: bool,
    /// Metrics collection interval in seconds
    pub collection_interval_secs: u64,
    /// Export metrics to file
    pub export_to_file: bool,
    /// Metrics export file path
    pub export_file: Option<PathBuf>,
}

/// Logging configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoggingConfig {
    /// Log level (trace, debug, info, warn, error)
    pub level: String,
    /// Enable structured logging
    pub structured: bool,
    /// Log file path (optional)
    pub file_path: Option<PathBuf>,
    /// Enable console output
    pub console_output: bool,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            evaluation: EvaluationConfig::default(),
            model: ModelConfig::default(),
            metrics: MetricsConfig::default(),
            logging: LoggingConfig::default(),
        }
    }
}

impl Default for EvaluationConfig {
    fn default() -> Self {
        Self {
            default_timeout_ms: 30000,
            max_concurrent_evaluations: 10,
            results_dir: PathBuf::from("./results"),
            cache_dir: PathBuf::from("./cache"),
        }
    }
}

impl Default for ModelConfig {
    fn default() -> Self {
        Self {
            default_model: "gpt-3.5-turbo".to_string(),
            api_endpoint: "https://api.openai.com/v1".to_string(),
            api_key: None,
            request_timeout_ms: 60000,
            max_retries: 3,
        }
    }
}

impl Default for MetricsConfig {
    fn default() -> Self {
        Self {
            enable_detailed_metrics: true,
            collection_interval_secs: 60,
            export_to_file: false,
            export_file: None,
        }
    }
}

impl Default for LoggingConfig {
    fn default() -> Self {
        Self {
            level: "info".to_string(),
            structured: false,
            file_path: None,
            console_output: true,
        }
    }
}

impl Config {
    /// Load configuration from file and environment variables
    pub fn load() -> crate::error::EvalResult<Self> {
        let config: Self = Figment::new()
            .merge(Toml::file("Config.toml"))
            .merge(Env::prefixed("AI_EVALS_"))
            .extract()
            .map_err(|e| crate::error::EvalError::invalid_configuration(
                format!("Failed to load configuration: {}", e)
            ))?;

        Ok(config)
    }

    /// Load configuration with custom file path
    pub fn load_from_file(path: &str) -> crate::error::EvalResult<Self> {
        let config: Self = Figment::new()
            .merge(Toml::file(path))
            .merge(Env::prefixed("AI_EVALS_"))
            .extract()
            .map_err(|e| crate::error::EvalError::invalid_configuration(
                format!("Failed to load configuration from {}: {}", path, e)
            ))?;

        Ok(config)
    }

    /// Validate configuration
    pub fn validate(&self) -> crate::error::EvalResult<()> {
        if self.evaluation.default_timeout_ms == 0 {
            return Err(crate::error::EvalError::invalid_configuration(
                "default_timeout_ms must be greater than 0"
            ));
        }

        if self.evaluation.max_concurrent_evaluations == 0 {
            return Err(crate::error::EvalError::invalid_configuration(
                "max_concurrent_evaluations must be greater than 0"
            ));
        }

        if self.model.request_timeout_ms == 0 {
            return Err(crate::error::EvalError::invalid_configuration(
                "model.request_timeout_ms must be greater than 0"
            ));
        }

        Ok(())
    }
}
