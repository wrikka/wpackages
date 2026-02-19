use thiserror::Error;

#[derive(Error, Debug)]
pub enum VectorSearchError {
    #[error("Dimension mismatch: expected {expected}, got {got}")]
    DimensionMismatch { expected: usize, got: usize },

    #[error("Index out of bounds: {index} (size: {size})")]
    IndexOutOfBounds { index: usize, size: usize },

    #[error("Invalid configuration: {0}")]
    InvalidConfig(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Serialization error: {0}")]
    Serde(#[from] serde_json::Error),

    #[error("Cache error: {0}")]
    Cache(String),

    #[error("Other error: {0}")]
    Other(#[from] anyhow::Error),
}

pub type VectorSearchResult<T> = Result<T, VectorSearchError>;
