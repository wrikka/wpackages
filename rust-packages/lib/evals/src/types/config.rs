//! Configuration types

use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Evaluation configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvalConfig {
    /// Evaluation name
    pub name: String,
    /// Model to use for evaluation
    pub model: String,
    /// Dataset path or identifier
    pub dataset: String,
    /// Timeout in milliseconds
    pub timeout_ms: u64,
    /// Maximum concurrent samples
    pub max_concurrent_samples: usize,
    /// Metrics to calculate
    pub metrics: Vec<String>,
    /// Output directory
    pub output_dir: Option<PathBuf>,
    /// Additional configuration
    pub additional_config: serde_json::Value,
}

impl Default for EvalConfig {
    fn default() -> Self {
        Self {
            name: "default_evaluation".to_string(),
            model: "gpt-3.5-turbo".to_string(),
            dataset: "default".to_string(),
            timeout_ms: 30_000,
            max_concurrent_samples: 10,
            metrics: vec!["accuracy".to_string(), "latency".to_string()],
            output_dir: None,
            additional_config: serde_json::Value::Null,
        }
    }
}

impl EvalConfig {
    /// Create a new evaluation configuration
    pub fn new(
        name: String,
        model: String,
        dataset: String,
    ) -> Self {
        Self {
            name,
            model,
            dataset,
            ..Default::default()
        }
    }

    /// Set timeout
    pub fn with_timeout(mut self, timeout_ms: u64) -> Self {
        self.timeout_ms = timeout_ms;
        self
    }

    /// Set maximum concurrent samples
    pub fn with_max_concurrent(mut self, max_concurrent: usize) -> Self {
        self.max_concurrent_samples = max_concurrent;
        self
    }

    /// Set metrics
    pub fn with_metrics(mut self, metrics: Vec<String>) -> Self {
        self.metrics = metrics;
        self
    }

    /// Set output directory
    pub fn with_output_dir(mut self, output_dir: PathBuf) -> Self {
        self.output_dir = Some(output_dir);
        self
    }

    /// Validate the configuration
    pub fn validate(&self) -> Result<(), String> {
        if self.name.is_empty() {
            return Err("Evaluation name cannot be empty".to_string());
        }

        if self.model.is_empty() {
            return Err("Model name cannot be empty".to_string());
        }

        if self.dataset.is_empty() {
            return Err("Dataset cannot be empty".to_string());
        }

        if self.timeout_ms == 0 {
            return Err("Timeout must be greater than 0".to_string());
        }

        if self.max_concurrent_samples == 0 {
            return Err("Max concurrent samples must be greater than 0".to_string());
        }

        Ok(())
    }
}
