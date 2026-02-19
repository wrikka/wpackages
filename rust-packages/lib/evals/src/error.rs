//! Error types for the evaluation framework

use thiserror::Error;

/// Main error type for evaluation operations
#[derive(Error, Debug)]
pub enum EvalError {
    #[error("Dataset not found: {0}")]
    DatasetNotFound(String),

    #[error("Invalid configuration: {0}")]
    InvalidConfiguration(String),

    #[error("Evaluation failed: {0}")]
    EvaluationFailed(String),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),

    #[error("Model error: {0}")]
   ModelError(String),

    #[error("Metric calculation error: {0}")]
    MetricError(String),

    #[error("Timeout error: operation timed out after {0}ms")]
    TimeoutError(u64),
}

/// Result type alias for evaluation operations
pub type EvalResult<T> = Result<T, EvalError>;

impl EvalError {
    /// Create a new dataset not found error
    pub fn dataset_not_found<T: Into<String>>(name: T) -> Self {
        Self::DatasetNotFound(name.into())
    }

    /// Create a new invalid configuration error
    pub fn invalid_configuration<T: Into<String>>(msg: T) -> Self {
        Self::InvalidConfiguration(msg.into())
    }

    /// Create a new evaluation failed error
    pub fn evaluation_failed<T: Into<String>>(msg: T) -> Self {
        Self::EvaluationFailed(msg.into())
    }

    /// Create a new model error
    pub fn model_error<T: Into<String>>(msg: T) -> Self {
        Self::ModelError(msg.into())
    }

    /// Create a new metric error
    pub fn metric_error<T: Into<String>>(msg: T) -> Self {
        Self::MetricError(msg.into())
    }

    /// Create a new timeout error
    pub fn timeout_error(ms: u64) -> Self {
        Self::TimeoutError(ms)
    }
}
