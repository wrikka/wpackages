//! Error types for AI Suite orchestration layer

use semantic_search::error::VectorSearchError;
use thiserror::Error;

/// Unified error type for AI Suite
#[derive(Error, Debug)]
pub enum AiSuiteError {
    #[error("Configuration error: {0}")]
    Config(String),

    #[error("Service initialization error: {0}")]
    ServiceInit(String),

    #[error("Completion error: {0}")]
    Completion(String),

    #[error("Embeddings error: {0}")]
    Embeddings(String),

    #[error("Vector search error: {0}")]
    VectorSearch(#[from] VectorSearchError),

    #[error("RAG error: {0}")]
    Rag(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Serialization error: {0}")]
    Serde(#[from] serde_json::Error),

    #[error("Tokio error: {0}")]
    Tokio(#[from] tokio::task::JoinError),

    #[error("Other error: {0}")]
    Other(#[from] anyhow::Error),
}

pub type AiSuiteResult<T> = Result<T, AiSuiteError>;
