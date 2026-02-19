use crate::error::{EmbeddingsError, EmbeddingsResult};
use crate::services::vector_db::{qdrant::QdrantDB, traits::VectorDB};
use crate::types::{Embedding, SearchResult};
use crate::VectorDBConfig;
use std::sync::Arc;

/// A service for interacting with a vector database.
pub struct VectorDBService {
    db: Arc<dyn VectorDB>,
}

impl VectorDBService {
    /// Creates a new VectorDBService.
    pub fn new(config: &VectorDBConfig) -> EmbeddingsResult<Self> {
        let db: Arc<dyn VectorDB> = match config.db_type.as_str() {
            "qdrant" => Arc::new(QdrantDB::new(&config.url, &config.collection_name)?),
            _ => {
                return Err(EmbeddingsError::InvalidConfig(format!(
                    "Unsupported vector database type: {}",
                    config.db_type
                )))
            }
        };
        Ok(Self { db })
    }

    /// Adds an embedding to the vector database.
    pub async fn add(&self, embedding: Embedding) -> EmbeddingsResult<()> {
        self.db.add(embedding).await
    }

    /// Searches for similar embeddings in the vector database.
    pub async fn search(&self, query: Embedding, limit: usize) -> EmbeddingsResult<Vec<SearchResult>> {
        self.db.search(query, limit).await
    }
}
