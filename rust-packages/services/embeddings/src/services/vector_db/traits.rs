use crate::error::EmbeddingsResult;
use crate::types::{Embedding, SearchResult};
use async_trait::async_trait;

/// A common interface for different vector database clients.
#[async_trait]
pub trait VectorDB: Send + Sync {
    /// Adds an embedding to the vector database.
    async fn add(&self, embedding: Embedding) -> EmbeddingsResult<()>;

    /// Searches for the most similar embeddings in the vector database.
    async fn search(&self, query: Embedding, limit: usize) -> EmbeddingsResult<Vec<SearchResult>>;
}
