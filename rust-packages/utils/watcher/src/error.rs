use thiserror::Error;

/// The main error type for the watcher library.
#[derive(Error, Debug)]
pub enum WatcherError {
    #[error("I/O error: {0}")]
    /// An underlying I/O error occurred.
    Io(#[from] std::io::Error),

    #[error("Backend error: {0}")]
    /// An error specific to the watcher backend (e.g., inotify, FSEvents).
    Backend(String),

    #[error("Path not found: {0}")]
    /// A path that was specified to be watched does not exist.
    PathNotFound(String),

    #[error("Invalid configuration: {0}")]
    /// The provided configuration was invalid.
    InvalidConfig(String),

    #[error("Internal channel error: {0}")]
    /// An internal error occurred with the event communication channel.
    Channel(String),

    #[error(transparent)]
    /// An error occurred while executing an action.
    ActionError(String),

    /// A catch-all for other kinds of errors.
    #[error(transparent)]
    Other(#[from] anyhow::Error),
}

pub type Result<T> = std::result::Result<T, WatcherError>;
