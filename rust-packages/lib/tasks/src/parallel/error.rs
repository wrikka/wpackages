//! Parallel processing error types

use thiserror::Error;

#[derive(Error, Debug)]
pub enum ParallelError {
    #[error("Configuration error: {0}")]
    Config(#[from] figment::Error),

    #[error("Parallel processing failed: {message}")]
    ParallelFailed { message: String, #[source] source: anyhow::Error },

    #[error("Task execution failed: {0}")]
    TaskFailed(String),

    #[error("Multiple errors occurred: {0:?}")]
    MultipleErrors(Vec<ParallelError>),

    #[error("Join error: {0}")]
    Join(#[from] tokio::task::JoinError),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Task not found: {0}")]
    TaskNotFound(u64),

    #[error("Channel error: {0}")]
    ChannelError(String),

    #[error(transparent)]
    Other(#[from] anyhow::Error),
}

pub type Result<T> = std::result::Result<T, ParallelError>;
