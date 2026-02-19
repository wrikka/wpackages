use thiserror::Error;

/// Error types for rsui library
#[derive(Error, Debug)]
pub enum RsuiError {
    #[error("Failed to create rsui application: {0}")]
    Create(String),

    #[error("Configuration error: {0}")]
    Config(#[from] figment::Error),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Not found: {resource} (id: {id})")]
    NotFound { resource: String, id: String },

    #[error("Theme error: {0}")]
    Theme(String),

    #[error("Widget error: {widget}: {message}")]
    Widget { widget: String, message: String },

    #[error("Invalid input: {0}")]
    InvalidInput(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Render error: {0}")]
    Render(String),

    #[error("State error: {0}")]
    State(String),

    #[error("Export error: {0}")]
    Export(String),

    #[error("External service failed: {service}")]
    ServiceError {
        service: String,
        #[source]
        source: anyhow::Error,
    },

    #[error(transparent)]
    Other(#[from] anyhow::Error),
}

/// Type alias for Result with RsuiError
pub type Result<T> = std::result::Result<T, RsuiError>;
