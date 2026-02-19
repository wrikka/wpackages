use thiserror::Error;

#[derive(Error, Debug)]
pub enum ChunkingError {
    #[error("Recursive chunking error: {0}")]
    Recursive(String),

    #[error("Semantic chunking error: {0}")]
    Semantic(String),

    #[error("Code-aware chunking error: {0}")]
    CodeAware(String),

    #[error("Invalid configuration: {0}")]
    InvalidConfig(String),

    #[error("Empty document")]
    EmptyDocument,

    #[error("{0}")]
    Custom(String),
}

pub type ChunkingResult<T> = Result<T, ChunkingError>;
