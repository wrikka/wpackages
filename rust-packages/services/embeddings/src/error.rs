use thiserror::Error;

/// Error types for the embeddings service
#[derive(Error, Debug)]
pub enum EmbeddingsError {
    #[error("Model loading error: {0}")]
    ModelLoad(String),

    #[error("Tokenization error: {0}")]
    Tokenization(String),

    #[error("Inference error: {0}")]
    Inference(String),

    #[error("Invalid configuration: {0}")]
    InvalidConfig(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Serialization error: {0}")]
    Serde(#[from] serde_json::Error),

    #[error(transparent)]
    Other(#[from] anyhow::Error),
}

pub type EmbeddingsResult<T> = Result<T, EmbeddingsError>;
