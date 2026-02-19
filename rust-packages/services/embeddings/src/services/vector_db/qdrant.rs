use crate::error::{EmbeddingsError, EmbeddingsResult};
use crate::services::vector_db::traits::VectorDB;
use crate::types::{Embedding, SearchResult};
use async_trait::async_trait;
use qdrant_client::prelude::*;
use qdrant_client::qdrant::{PointStruct, SearchPoints, ScoredPoint};
use uuid::Uuid;

/// A Qdrant client for vector database operations.
pub struct QdrantDB {
    client: QdrantClient,
    collection_name: String,
}

impl QdrantDB {
    /// Creates a new QdrantDB client.
    pub fn new(url: &str, collection_name: &str) -> EmbeddingsResult<Self> {
        let client = QdrantClient::from_url(url).build().map_err(|e| {
            EmbeddingsError::VectorDB(format!("Failed to create Qdrant client: {}", e))
        })?;
        Ok(Self {
            client,
            collection_name: collection_name.to_string(),
        })
    }
}

#[async_trait]
impl VectorDB for QdrantDB {
    async fn add(&self, embedding: Embedding) -> EmbeddingsResult<()> {
        let points = vec![PointStruct::new(
            Uuid::new_v4().to_string(),
            embedding,
            None,
        )];
        self.client
            .upsert_points(&self.collection_name, None, points, None)
            .await
            .map_err(|e| EmbeddingsError::VectorDB(format!("Failed to add point to Qdrant: {}", e)))?;
        Ok(())
    }

    async fn search(&self, query: Embedding, limit: usize) -> EmbeddingsResult<Vec<SearchResult>> {
        let search_request = SearchPoints {
            collection_name: self.collection_name.clone(),
            vector: query,
            limit: limit as u64,
            with_payload: Some(true.into()),
            ..
            Default::default()
        };

        let search_result = self
            .client
            .search_points(&search_request)
            .await
            .map_err(|e| EmbeddingsError::VectorDB(format!("Failed to search points in Qdrant: {}", e)))?;

        let search_results = search_result
            .result
            .into_iter()
            .map(|scored_point: ScoredPoint| SearchResult {
                id: scored_point.id.map(|id| id.to_string()).unwrap_or_default(),
                score: scored_point.score,
                payload: scored_point.payload,
            })
            .collect();

        Ok(search_results)
    }
}
