//! Vector store adapter for similarity search

use crate::error::RagResult;
use crate::domain::{MetadataFilter, TextChunk};
use crate::utils::math::cosine_similarity;
use async_trait::async_trait;

/// Trait for vector storage and retrieval
#[async_trait]
pub trait VectorStore: Send + Sync {
    async fn add(&self, chunk: &TextChunk, embedding: Vec<f32>) -> RagResult<()>;

    async fn add_batch(&self, chunks: &[TextChunk], embeddings: &[Vec<f32>]) -> RagResult<()> {
        for (chunk, embedding) in chunks.iter().zip(embeddings.iter()) {
            self.add(chunk, embedding.clone()).await?;
        }
        Ok(())
    }

        async fn search(
        &self,
        query_embedding: &[f32],
        top_k: usize,
        filter: Option<&MetadataFilter>,
    ) -> RagResult<Vec<(TextChunk, f32)>>;

    async fn delete(&self, chunk_id: &str) -> RagResult<()>;
}

/// In-memory vector store for testing
pub struct InMemoryVectorStore {
    entries: std::sync::Arc<
        tokio::sync::RwLock<std::collections::HashMap<String, (TextChunk, Vec<f32>)>>,
    >,
}

impl InMemoryVectorStore {
    pub fn new() -> Self {
        Self {
            entries: std::sync::Arc::new(tokio::sync::RwLock::new(std::collections::HashMap::new())),
        }
    }
}

impl Default for InMemoryVectorStore {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl VectorStore for InMemoryVectorStore {
    async fn add(&self, chunk: &TextChunk, embedding: Vec<f32>) -> RagResult<()> {
        let mut entries = self.entries.write().await;
        entries.insert(chunk.id.clone(), (chunk.clone(), embedding));
        Ok(())
    }

    async fn search(
        &self,
        query_embedding: &[f32],
        top_k: usize,
        filter: Option<&MetadataFilter>,
    ) -> RagResult<Vec<(TextChunk, f32)>> {
        let entries = self.entries.read().await;

        let mut results: Vec<(TextChunk, f32)> = entries
            .values()
            .filter(|(chunk, _embedding)| {
                if let Some(f) = filter {
                    if !f.filters.is_empty() {
                        return chunk.metadata.as_ref().map_or(false, |meta| {
                            f.filters.iter().all(|(k, v)| {
                                meta.get(k).and_then(|val| val.as_str()).map_or(false, |meta_v| meta_v == v)
                            })
                        });
                    }
                }
                true
            })
            .map(|(chunk, embedding)| {
                let score = cosine_similarity(query_embedding, embedding);
                (chunk.clone(), score)
            })
            .collect();

        results.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        results.truncate(top_k);

        Ok(results)
    }
        let entries = self.entries.read().await;

            }

    async fn delete(&self, chunk_id: &str) -> RagResult<()> {
        let mut entries = self.entries.write().await;
        entries.remove(chunk_id);
        Ok(())
    }
}
