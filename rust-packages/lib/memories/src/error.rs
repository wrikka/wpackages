use crate::decay::DecayError;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum MemorySystemError {
    #[error("Invalid memory operation: {0}")]
    InvalidOperation(String),

    #[error("Memory not found")]
    MemoryNotFound,

    #[error("Decay error: {0}")]
    DecayError(#[from] DecayError),

    #[error("Vector similarity error: {0}")]
    SimilarityError(String),

    #[error("System time error: {0}")]
    TimeError(String),
}
