//! Queue error types

use thiserror::Error;

#[derive(Error, Debug)]
pub enum QueueError {
    #[error("Configuration error: {0}")]
    Config(#[from] figment::Error),

    #[error("Queue is empty")]
    QueueEmpty,

    #[error("Queue is full: max_size={max_size}")]
    QueueFull { max_size: usize },

    #[error("Task not found: {task_id}")]
    TaskNotFound { task_id: String },

    #[error("Task processing failed: {message}")]
    TaskFailed {
        message: String,
        #[source]
        source: anyhow::Error,
    },

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Join error: {0}")]
    Join(#[from] tokio::task::JoinError),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error(transparent)]
    Other(#[from] anyhow::Error),
}

pub type Result<T> = std::result::Result<T, QueueError>;
