//! Error handling for task management

use thiserror::Error;

/// Main error type for the task library
#[derive(Error, Debug)]
pub enum TaskError {
    #[error("Configuration error: {0}")]
    Config(#[from] figment::Error),

    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Queue error: {message}")]
    Queue {
        message: String,
        #[source]
        source: anyhow::Error,
    },

    #[error("Scheduler error: {message}")]
    Scheduler {
        message: String,
        #[source]
        source: anyhow::Error,
    },

    #[error("Parallel processing error: {message}")]
    Parallel {
        message: String,
        #[source]
        source: anyhow::Error,
    },

    #[error("Task not found: {task_id}")]
    TaskNotFound { task_id: String },

    #[error("Queue is empty")]
    QueueEmpty,

    #[error("Queue is full: max_size={max_size}")]
    QueueFull { max_size: usize },

    #[error("Invalid state: expected={expected}, actual={actual}")]
    InvalidState { expected: String, actual: String },

    #[error("Timeout: operation took longer than {timeout_seconds}s")]
    Timeout { timeout_seconds: u64 },

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Join error: {0}")]
    Join(#[from] tokio::task::JoinError),

    #[error("Invalid CRON expression: {0}")]
    InvalidCron(String),

    #[error("Task execution failed: {0}")]
    ExecutionFailed(String),

    #[error("Retry exhausted: {0}")]
    RetryExhausted(String),

    #[error(transparent)]
    Other(#[from] anyhow::Error),
}

pub type Result<T> = std::result::Result<T, TaskError>;
