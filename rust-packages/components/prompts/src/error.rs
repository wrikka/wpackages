use std::fmt;
use std::io;

/// Result type for prompt operations
pub type Result<T> = std::result::Result<T, Error>;

/// Error types for the prompt library
#[derive(Debug, thiserror::Error)]
pub enum Error {
    /// IO error from terminal
    #[error("IO error: {0}")]
    Io(#[from] io::Error),

    /// User cancelled the prompt (Ctrl+C, Esc)
    #[error("Operation cancelled by user")]
    Cancelled,

    /// Validation failed
    #[error("Validation failed: {0}")]
    Validation(String),

    /// Invalid input format
    #[error("Invalid input: {0}")]
    InvalidInput(String),

    /// Template rendering error
    #[error("Template error: {0}")]
    Template(String),

    /// Serialization/Deserialization error
    #[error("Serialization error: {0}")]
    Serialization(String),

    /// Terminal capability not supported
    #[error("Terminal not supported: {0}")]
    UnsupportedTerminal(String),

    /// History error
    #[error("History error: {0}")]
    History(String),

    /// Clipboard error
    #[error("Clipboard error: {0}")]
    Clipboard(String),

    /// Timeout
    #[error("Operation timed out")]
    Timeout,

    /// Custom error
    #[error("{0}")]
    Custom(String),
}

impl Error {
    /// Check if the error is due to user cancellation
    pub fn is_cancelled(&self) -> bool {
        matches!(self, Error::Cancelled)
    }

    /// Check if the error is a timeout
    pub fn is_timeout(&self) -> bool {
        matches!(self, Error::Timeout)
    }

    /// Check if the error is a validation failure
    pub fn is_validation(&self) -> bool {
        matches!(self, Error::Validation(_))
    }

    /// Create a custom error
    pub fn custom(msg: impl fmt::Display) -> Self {
        Error::Custom(msg.to_string())
    }
}

/// Helper trait for converting errors
pub trait IntoPromptError {
    fn into_prompt_error(self) -> Error;
}

impl IntoPromptError for io::Error {
    fn into_prompt_error(self) -> Error {
        Error::Io(self)
    }
}
