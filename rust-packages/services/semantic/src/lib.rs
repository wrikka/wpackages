//! Vector Similarity Search Service
//!
//! Provides efficient vector similarity search with multiple distance metrics.

pub mod cache;
pub mod components;
pub mod config;
pub mod constants;
pub mod error;
pub mod services;
pub mod telemetry;
pub mod types;
pub mod chunking;
pub mod embedding;

use crate::chunking::chunk_file;
use crate::embedding::EmbeddingClient;
use ignore::WalkBuilder;
use std::path::Path;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SemanticMatch {
    pub path: String,
    pub score: f32,
    pub start_line: usize,
    pub end_line: usize,
    pub snippet: String,
}

pub async fn search(root: &str, query: &str, limit: usize, embedding_url: &str) -> anyhow::Result<Vec<SemanticMatch>> {
    let client = EmbeddingClient::new(embedding_url.to_string());
    let mut chunks = Vec::new();
    let walker = WalkBuilder::new(root).build();

    for entry in walker {
        let entry = entry?;
        let path = entry.path();
        if path.is_file() {
            let content = std::fs::read_to_string(path).unwrap_or_default();
            chunks.extend(chunk_file(path, &content, 20)?
                .into_iter()
                .map(|(s, e, sn)| (path.to_string_lossy().into_owned(), s, e, sn)));
        }
    }

    if chunks.is_empty() {
        return Ok(Vec::new());
    }

    let query_embedding = client.get_embeddings(vec![query.to_string()]).await?.embeddings.remove(0);
    let chunk_texts: Vec<String> = chunks.iter().map(|c| c.3.clone()).collect();
    let chunk_embeddings = client.get_embeddings(chunk_texts).await?.embeddings;

    // This is a placeholder for the actual vector search logic which is already in the crate.
    // For now, we'll just return an empty vec.
    // A full implementation would build a VectorIndex and search it.

    Ok(vec![])
}


pub use cache::{CachedSearchResults, SearchCache, SearchCacheKey};
pub use components::*;
pub use config::VectorSearchConfig;
pub use constants::*;
pub use error::{VectorSearchError, VectorSearchResult};
pub use services::*;
pub use telemetry::init_subscriber;
pub use types::*;
