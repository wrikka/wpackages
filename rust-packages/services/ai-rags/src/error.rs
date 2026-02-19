use cache::error::CacheError;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum RagError {
    #[error("Document processing error: {0}")]
    DocumentProcessing(String),

    #[error("Chunking error: {0}")]
    Chunking(String),

    #[error("Embedding generation error: {0}")]
    EmbeddingError(String),

    #[error("Retrieval error: {0}")]
    Retrieval(String),

    #[error("Generation error: {0}")]
    Generation(String),

    #[error("Invalid configuration: {0}")]
    InvalidConfig(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Serialization error: {0}")]
    Serde(#[from] serde_json::Error),

    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),

    #[error("Other error: {0}")]
    Other(#[from] anyhow::Error),

    #[error("Cache error: {0}")]
    Cache(#[from] CacheError),
}

pub type RagResult<T> = Result<T, RagError>;
