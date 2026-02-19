use thiserror::Error;

#[derive(Error, Debug)]
pub enum TelemetryError {
    #[error("Failed to initialize tracing: {0}")]
    TracingInitError(#[from] tracing::subscriber::SetGlobalDefaultError),

    #[error("Failed to initialize Sentry")]
    SentryInitError(String),

    #[error("Failed to create log appender: {0}")]
    AppenderError(#[from] std::io::Error),

    #[error("Configuration error: {0}")]
    ConfigError(String),
}

pub type Result<T> = std::result::Result<T, TelemetryError>;
