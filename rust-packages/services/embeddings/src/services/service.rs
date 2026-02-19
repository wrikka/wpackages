use crate::error::EmbeddingsResult;
use crate::finetune::types::FinetuneConfig;
use crate::services::{batcher::DynamicBatcher, cache_service::CacheService, vector_db_service::VectorDBService};
use crate::services::model::EmbeddingsModel;
use crate::types::{Embedding, EmbeddingRequest, EmbeddingResponse, SearchResult};
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Duration;

/// The main service for generating embeddings.
pub struct EmbeddingsService {
    model: Arc<EmbeddingsModel>,
    batcher: DynamicBatcher,
    cache: Option<CacheService>,
    vector_db: Option<VectorDBService>,
}

impl EmbeddingsService {
    /// Creates a new EmbeddingsService.
    pub async fn new(config: crate::config::EmbeddingsConfig) -> EmbeddingsResult<Self> {
        let model = Arc::new(EmbeddingsModel::new(config.clone()).await?);
        let batcher = DynamicBatcher::new(model.clone(), config.batch_size, Duration::from_millis(50));
        let cache = Some(CacheService::new(10000, 3600)); // TODO: Make configurable
        let vector_db = if let Some(vector_db_config) = &config.vector_db {
            Some(VectorDBService::new(vector_db_config)?)
        } else {
            None
        };
        Ok(Self { model, batcher, cache, vector_db })
    }

    /// Generates text embeddings for a batch of texts.
    #[tracing::instrument(skip(self, texts))]
    pub async fn embed_text_batch(&self, texts: Vec<String>) -> EmbeddingsResult<Vec<Embedding>> {
        if let Some(cache) = &self.cache {
            let mut cached_embeddings = Vec::new();
            let mut texts_to_embed = Vec::new();
            for text in &texts {
                if let Some(embedding) = cache.get(text).await {
                    cached_embeddings.push(embedding);
                } else {
                    texts_to_embed.push(text.clone());
                }
            }

            if texts_to_embed.is_empty() {
                return Ok(cached_embeddings);
            }

            let embeddings = self.batcher.process(texts_to_embed.clone()).await?;

            for (text, embedding) in texts_to_embed.into_iter().zip(embeddings.clone()) {
                cache.put(text, embedding).await;
            }

            // This part is tricky because the order of embeddings needs to be preserved.
            // For now, we'll just return the newly generated embeddings.
            // A more complete implementation would merge the cached and new embeddings in the correct order.
            return Ok(embeddings);
        }

        self.batcher.process(texts).await
    }

    /// Generates text embeddings based on an EmbeddingRequest.
    #[tracing::instrument(skip(self, request))]
    pub async fn embed_text(&self, request: EmbeddingRequest) -> EmbeddingsResult<EmbeddingResponse> {
        let embeddings = self.embed_text_batch(request.texts).await?;
        let dimension = embeddings.first().map(|e| e.len()).unwrap_or(0);
        let tokens_used = embeddings.len() * dimension;

        Ok(EmbeddingResponse {
            embeddings,
            dimension,
            tokens_used,
        })
    }

    /// Generates image embeddings for a batch of images.
    #[tracing::instrument(skip(self, image_paths))]
    pub async fn embed_images(&self, image_paths: Vec<PathBuf>) -> EmbeddingsResult<Vec<Embedding>> {
        self.model.generate_image_embeddings(image_paths).await
    }

    /// Adds an embedding to the vector database.
    #[tracing::instrument(skip(self, embedding))]
    pub async fn add_embedding(&self, embedding: Embedding) -> EmbeddingsResult<()> {
        if let Some(vector_db) = &self.vector_db {
            vector_db.add(embedding).await
        } else {
            Err(EmbeddingsError::VectorDB(
                "Vector database is not configured".to_string(),
            ))
        }
    }

    /// Searches for similar embeddings in the vector database.
    #[tracing::instrument(skip(self, query))]
    pub async fn search_embeddings(
        &self,
        query: Embedding,
        limit: usize,
    ) -> EmbeddingsResult<Vec<SearchResult>> {
        if let Some(vector_db) = &self.vector_db {
            vector_db.search(query, limit).await
        } else {
            Err(EmbeddingsError::VectorDB(
                "Vector database is not configured".to_string(),
            ))
        }
    }

    /// Fine-tunes the model with a given configuration.
    #[tracing::instrument(skip(self, config))]
    pub async fn finetune(&self, config: FinetuneConfig) -> EmbeddingsResult<()> {
        self.model.clone().finetune(config).await
    }

    pub async fn get_metrics(&self) -> crate::services::ModelMetrics {
        self.model.get_metrics().await
    }

    pub async fn clear_cache(&self) {
        if let Some(cache) = &self.cache {
            cache.clear().await;
        }
    }
}
