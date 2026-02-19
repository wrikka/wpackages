use thiserror::Error;

#[derive(Error, Debug)]
pub enum CompletionError {
    #[error("Model error: {0}")]
    Model(String),

    #[error("API error: {0}")]
    Api(String),

    #[error("Invalid request: {0}")]
    InvalidRequest(String),

    #[error("Configuration error: {0}")]
    Config(String),

    #[error("Rate limit exceeded: {0}")]
    RateLimit(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Serialization error: {0}")]
    Serde(#[from] serde_json::Error),

    #[error("HTTP error: {0}")]
    Http(String),

    #[error("Other error: {0}")]
    Other(#[from] anyhow::Error),

    #[error("Cache error: {0}")]
    Cache(#[from] cache::CacheError),
}

pub type CompletionResult<T> = Result<T, CompletionError>;
