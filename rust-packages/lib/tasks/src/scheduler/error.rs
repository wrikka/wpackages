//! Scheduler error types

use thiserror::Error;

#[derive(Error, Debug)]
pub enum SchedulerError {
    #[error("Configuration error: {0}")]
    Config(#[from] figment::Error),

    #[error("Scheduler failed: {message}")]
    SchedulerFailed {
        message: String,
        #[source]
        source: anyhow::Error,
    },

    #[error("Scheduler is busy")]
    SchedulerBusy,

    #[error("Task not found: {task_id}")]
    TaskNotFound { task_id: String },

    #[error("Invalid schedule: {0}")]
    InvalidSchedule(String),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Join error: {0}")]
    Join(#[from] tokio::task::JoinError),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error(transparent)]
    Other(#[from] anyhow::Error),
}

pub type Result<T> = std::result::Result<T, SchedulerError>;
