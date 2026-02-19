//! Application Layer - Orchestrates AI services
//!
//! This layer coordinates between different AI services (completion, embeddings, semantic-search, rags)
//! to provide a unified interface for the application.

use crate::config::AiSuiteConfig;
use crate::error::{AiSuiteError, AiSuiteResult};
use std::sync::Arc;
use tokio::sync::RwLock;

#[cfg(feature = "completion")]
use completion::config::{ApiConfig, CompletionConfig as CompletionServiceConfig};
use completion::services::{CompletionClient, CompletionService, MockCompletionClient};

#[cfg(feature = "embeddings")]
use embeddings::{EmbeddingsConfig as EmbeddingsServiceConfig, EmbeddingsModel};

#[cfg(feature = "semantic-search")]
use semantic_search::{VectorIndex, VectorSearchConfig as VectorSearchServiceConfig};

#[cfg(feature = "rags")]
use rags::{RagConfig as RagServiceConfig, RagService};

/// Main AI Suite application orchestrator
pub struct AiSuite {
    config: Arc<RwLock<AiSuiteConfig>>,

    #[cfg(feature = "completion")]
    completion_service: Option<Arc<CompletionService>>,

    #[cfg(feature = "embeddings")]
    embeddings_model: Option<Arc<EmbeddingsModel>>,

    #[cfg(feature = "semantic-search")]
    vector_index: Option<Arc<RwLock<VectorIndex>>>,

    #[cfg(feature = "rags")]
    rag_service: Option<Arc<RagService>>,
}

impl AiSuite {
    /// Create a new AI Suite instance
    pub async fn new(config: AiSuiteConfig) -> AiSuiteResult<Self> {
        let config = Arc::new(RwLock::new(config));

        #[cfg(feature = "completion")]
        let completion_service = if config.read().await.completion.enabled {
            Some(Self::init_completion_service(&config).await?)
        } else {
            None
        };

        #[cfg(feature = "embeddings")]
        let embeddings_model = if config.read().await.embeddings.enabled {
            Some(Self::init_embeddings_model(&config).await?)
        } else {
            None
        };

        #[cfg(feature = "semantic-search")]
        let vector_index = if config.read().await.vector_search.enabled {
            Some(Self::init_vector_index(&config).await?)
        } else {
            None
        };

        #[cfg(feature = "rags")]
        let rag_service = if config.read().await.rag.enabled {
            Some(Self::init_rag_service(&config).await?)
        } else {
            None
        };

        Ok(Self {
            config,
            #[cfg(feature = "completion")]
            completion_service,
            #[cfg(feature = "embeddings")]
            embeddings_model,
            #[cfg(feature = "semantic-search")]
            vector_index,
            #[cfg(feature = "rags")]
            rag_service,
        })
    }

    #[cfg(feature = "completion")]
    async fn init_completion_service(
        config: &Arc<RwLock<AiSuiteConfig>>,
    ) -> AiSuiteResult<Arc<CompletionService>> {
        let cfg = config.read().await;
        let completion_config = CompletionServiceConfig {
            api: ApiConfig {
                api_key: "api_key_placeholder".to_string(), // Placeholder
                model: cfg.completion.model.clone(),
                max_tokens: cfg.completion.max_tokens,
                temperature: cfg.completion.temperature,
                ..Default::default()
            },
            ..Default::default()
        };

        drop(cfg);

        let client =
            Arc::new(MockCompletionClient::new(true)) as Arc<dyn CompletionClient>;
        let service = CompletionService::new(completion_config, client);

        Ok(Arc::new(service))
    }

    #[cfg(feature = "embeddings")]
    async fn init_embeddings_model(
        config: &Arc<RwLock<AiSuiteConfig>>,
    ) -> AiSuiteResult<Arc<EmbeddingsModel>> {
        let cfg = config.read().await;
        let embeddings_config = EmbeddingsServiceConfig {
            model_path: "/path/to/model".to_string(), // Placeholder
            tokenizer_path: "/path/to/tokenizer".to_string(), // Placeholder
            batch_size: cfg.embeddings.batch_size,
            max_length: None,
            normalize: None,
        };

        drop(cfg);

        let model = EmbeddingsModel::new(embeddings_config)
            .await
            .map_err(|e| AiSuiteError::ServiceInit(format!("Failed to init embeddings: {}", e)))?;

        Ok(Arc::new(model))
    }

    #[cfg(feature = "semantic-search")]
    async fn init_vector_index(
        config: &Arc<RwLock<AiSuiteConfig>>,
    ) -> AiSuiteResult<Arc<RwLock<VectorIndex>>> {
        let cfg = config.read().await;
        let vector_config = VectorSearchServiceConfig::new(768).with_parallel(true);

        drop(cfg);

        let index = VectorIndex::new(vector_config)?;
        Ok(Arc::new(RwLock::new(index)))
    }

    #[cfg(feature = "rags")]
    async fn init_rag_service(
        config: &Arc<RwLock<AiSuiteConfig>>,
    ) -> AiSuiteResult<Arc<RagService>> {
        let cfg = config.read().await;
        let rag_config = RagServiceConfig::new()
            .with_chunk_size(cfg.rag.chunk_size)
            .with_chunk_overlap(cfg.rag.chunk_overlap)
            .with_top_k(cfg.rag.top_k);

        drop(cfg);

        let service = RagService::new(rag_config);
        Ok(Arc::new(service))
    }

    /// Get the configuration
    pub async fn get_config(&self) -> AiSuiteConfig {
        self.config.read().await.clone()
    }

    /// Update the configuration
    pub async fn set_config(&self, config: AiSuiteConfig) -> AiSuiteResult<()> {
        *self.config.write().await = config;
        Ok(())
    }

    /// Check if AI Suite is ready
    pub async fn is_ready(&self) -> bool {
        #[cfg(feature = "completion")]
        if let Some(service) = &self.completion_service {
            if service.is_ready().await.is_err() {
                return false;
            }
        }

        true
    }
}
