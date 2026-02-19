//! Error types for workflow engine

use thiserror::Error;

/// Result type alias for workflow operations
pub type Result<T> = std::result::Result<T, WorkflowError>;

/// Errors that can occur in workflow operations
#[derive(Debug, Error)]
pub enum WorkflowError {
    #[error("Workflow not found: {0}")]
    WorkflowNotFound(String),

    #[error("Step execution failed: {0}")]
    StepExecutionFailed(String),

    #[error("Condition evaluation failed: {0}")]
    ConditionFailed(String),

    #[error("Extraction failed: {0}")]
    ExtractionFailed(String),

    #[error("Validation failed: {0}")]
    ValidationFailed(String),

    #[error("Timeout: {0}")]
    Timeout(String),

    #[error("Max retries exceeded for step: {0}")]
    MaxRetriesExceeded(String),

    #[error("Invalid workflow configuration: {0}")]
    InvalidConfiguration(String),

    #[error("Variable not found: {0}")]
    VariableNotFound(String),

    #[error("Executor error: {0}")]
    Executor(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
}
