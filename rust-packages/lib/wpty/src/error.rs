use thiserror::Error;

/// Application errors with context and backtrace support
#[derive(Debug, Error)]
pub enum AppError {
    /// Configuration error
    #[error("Configuration error: {0}")]
    Config(#[from] figment::Error),

    /// I/O error with context
    #[error("I/O error {context}: {source}")]
    Io {
        context: String,
        #[source]
        source: std::io::Error,
    },

    /// Failed to open PTY
    #[error("Failed to open PTY: {0}")]
    OpenPty(#[source] std::io::Error),

    /// Failed to spawn process
    #[error("Failed to spawn process: {0}")]
    Spawn(#[source] std::io::Error),

    /// Failed to write to PTY
    #[error("Failed to write to PTY: {0}")]
    Write(String),

    /// Failed to resize PTY
    #[error("Failed to resize PTY: {0}")]
    Resize(#[source] std::io::Error),

    /// Failed to kill process
    #[error("Failed to kill process: {0}")]
    Kill(#[source] std::io::Error),

    /// Failed to get PTY size
    #[error("Failed to get PTY size: {0}")]
    GetSize(#[source] std::io::Error),

    /// Session not found
    #[error("Session not found: {0}")]
    SessionNotFound(u32),

    /// Internal error
    #[error("Internal error: {0}")]
    Internal(String),

    /// Serialization error
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    /// Task join error
    #[error("Task join error: {0}")]
    JoinError(#[from] tokio::task::JoinError),

    /// Channel send error
    #[error("Channel send error: {0}")]
    ChannelSend(String),

    /// Channel receive error
    #[error("Channel receive error: {0}")]
    ChannelRecv(String),

    /// Validation error
    #[error("Validation error: {0}")]
    Validation(String),
}

impl AppError {
    /// Create I/O error with context
    pub fn io<E: Into<std::io::Error>>(context: impl Into<String>, source: E) -> Self {
        Self::Io {
            context: context.into(),
            source: source.into(),
        }
    }

    /// Create internal error
    pub fn internal(message: impl Into<String>) -> Self {
        Self::Internal(message.into())
    }

    /// Create write error
    pub fn write(context: impl Into<String>) -> Self {
        Self::Write(context.into())
    }

    /// Create session not found error
    pub fn session_not_found(id: u32) -> Self {
        Self::SessionNotFound(id)
    }

    /// Create validation error
    pub fn validation(message: impl Into<String>) -> Self {
        Self::Validation(message.into())
    }
}

// Helper to convert AppError to napi::Error
impl From<AppError> for napi::Error {
    fn from(e: AppError) -> Self {
        napi::Error::new(napi::Status::GenericFailure, e.to_string())
    }
}

// Helper for result types
pub type Result<T> = std::result::Result<T, AppError>;

/// Extension trait for adding context to results
pub trait ContextExt<T, E> {
    /// Add context to error
    fn context(self, ctx: impl Into<String>) -> Result<T>;
}

impl<T, E: std::error::Error + Send + Sync + 'static> ContextExt<T, E>
    for std::result::Result<T, E>
{
    fn context(self, ctx: impl Into<String>) -> Result<T> {
        self.map_err(|e| AppError::Internal(format!("{}: {}", ctx.into(), e)))
    }
}
