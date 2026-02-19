//! Application Layer - Orchestrates AI model operations
//!
//! This layer coordinates between different services to provide a unified interface.

use crate::config::{AiModelsConfig, CacheBackendType};
use crate::error::{AiModelsError, Result};
use crate::services::analytics::AnalyticsService;
use crate::services::cache::{FileCache, InMemoryCache, ResponseCache};
use crate::services::cost_tracker::CostTracker;
use crate::services::middleware::{MiddlewareManager, ModerationMiddleware};
use crate::services::registry::ModelRegistry;
use crate::services::rate_limiter::RateLimiter;
use crate::services::strategy::StrategyManager;
use crate::services::RetryConfig;
use crate::types::image::{ImageRequest, ImageResponse};
use crate::types::moderation::{ModerationRequest, ModerationResponse};
use crate::types::*;
use std::pin::Pin;
use std::sync::Arc;
use tokio::sync::RwLock;

/// AI Models Application
pub struct AiModelsApp {
    registry: Arc<RwLock<ModelRegistry>>,
    cache: Arc<ResponseCache>,
    retry_config: RetryConfig,
    analytics: Arc<AnalyticsService>,
    cost_tracker: Arc<CostTracker>,
    middleware: Arc<RwLock<MiddlewareManager>>,
    strategy_manager: Arc<StrategyManager>,
    rate_limiter: Arc<RateLimiter>,
}

impl AiModelsApp {
    /// Create a new AI Models application from configuration
    pub async fn from_config(config: AiModelsConfig) -> Result<Self> {
        let registry = Arc::new(RwLock::new(
            crate::services::registry::create_default_registry().await?,
        ));

        let cache = if config.cache.enabled {
            let backend: Arc<dyn crate::services::cache::CacheBackend> = match config.cache.backend {
                CacheBackendType::InMemory => {
                    Arc::new(InMemoryCache::new(config.cache.ttl_seconds))
                }
                CacheBackendType::File => {
                    let path = config.cache.path.unwrap_or_else(|| ".cache".to_string());
                    Arc::new(FileCache::new(path).await?)
                }
            };
            Arc::new(ResponseCache::new(backend))
        } else {
            // Create a dummy cache if disabled
            Arc::new(ResponseCache::new(Arc::new(InMemoryCache::new(0))))
        };

        let cost_tracker = Arc::new(CostTracker::new(registry.clone()));
        let analytics = Arc::new(AnalyticsService::new());
        let strategy_manager = Arc::new(StrategyManager::new(
            config.strategy.clone(),
            registry.clone(),
            analytics.clone(),
        ));

        let middleware_manager = Arc::new(RwLock::new(MiddlewareManager::new()));
        if config.moderation.enabled {
            let moderation_provider = registry.read().await.get_default_moderation_provider().await?;
            let moderation_middleware = Arc::new(ModerationMiddleware::new(moderation_provider));
            middleware_manager.write().await.add_request_middleware(moderation_middleware);
        }

        let rate_limiter = Arc::new(RateLimiter::new());
        for (provider_name, provider_config) in &config.providers {
            if let Some(provider_type) = crate::config::ProviderType::from_str(provider_name) {
                rate_limiter.configure_provider(provider_type, provider_config.rate_limit.clone()).await;
            }
        }

        Ok(Self {
            registry,
            cache,
            retry_config: config.retry,
            analytics,
            cost_tracker,
            middleware: middleware_manager,
            strategy_manager,
            rate_limiter,
        })
    }


    /// Get the model registry
    pub fn registry(&self) -> &Arc<RwLock<ModelRegistry>> {
        &self.registry
    }

    /// Get the cache
    pub fn cache(&self) -> &Arc<ResponseCache> {
        &self.cache
    }

    /// Send a chat completion request
    #[tracing::instrument(skip(self, request))]
    pub async fn chat(&self, request: ChatRequest) -> Result<ChatResponse> {
        // Apply request middleware
        let request = self.middleware.read().await.apply_request_middleware(request).await?;

        let start_time = std::time::Instant::now();

        // Get provider and check rate limit
        let (provider, provider_name) = {
            let registry = self.registry.read().await;
            let provider = registry.get_default_chat_provider().await?;
            let provider_name = provider.name().to_string();
            (provider, provider_name)
        };
        self.rate_limiter.check_and_record(provider.provider_type()).await?;


        // Check cache first
        if let Some(cached) = self.cache.get_chat(&request).await {
            tracing::debug!("Cache hit for chat request");
            return Ok(cached);
        }

        tracing::debug!("Cache miss for chat request");


        // Execute with retry
        let response = crate::services::retry_with_backoff(&self.retry_config, || {
            provider.chat(request.clone())
        })
        .await?;

        // Apply response middleware
        let response = self.middleware.read().await.apply_response_middleware(response).await?;

        // Cache the response
        self.cache.put_chat(&request, &response).await?;

        // Calculate cost
        let cost = self.cost_tracker.calculate_cost(&response).await.ok();

        // Log the request
        self.analytics.log(LogEntry {
            timestamp: std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs(),
            provider: provider_name,
            model: request.model.clone(),
            request_type: "chat".to_string(),
            latency: start_time.elapsed(),
            tokens_used: Some((response.usage.prompt_tokens, response.usage.completion_tokens)),
            cost,
            is_error: false,
            error_message: None,
        });

        Ok(response)
    }

    /// Send a chat completion request with streaming
    #[tracing::instrument(skip(self, request))]
    pub async fn chat_stream(
        &self,
        request: ChatRequest,
    ) -> Result<Pin<Box<dyn futures::Stream<Item = Result<ChatChunk>> + Send>>> {
        let registry = self.registry.read().await;
        let provider = registry.get_default_chat_provider().await?;
        drop(registry);

        provider.chat_stream(request).await
    }

    /// Send a text completion request
    #[tracing::instrument(skip(self, request))]
    pub async fn complete(&self, request: CompletionRequest) -> Result<CompletionResponse> {
        // Check cache first
        if let Some(cached) = self.cache.get_completion(&request).await {
            tracing::debug!("Cache hit for completion request");
            return Ok(cached);
        }

        tracing::debug!("Cache miss for completion request");

        // Get provider
        let registry = self.registry.read().await;
        let provider = registry.get_default_completion_provider().await?;
        drop(registry);

        // Execute with retry
        let response = crate::services::retry_with_backoff(&self.retry_config, || {
            provider.complete(request.clone())
        })
        .await?;

        // Cache the response
        self.cache
            .put_completion(&request, response.clone())
            .await?;

        Ok(response)
    }

    /// Send a text completion request with streaming
    #[tracing::instrument(skip(self, request))]
    pub async fn complete_stream(
        &self,
        request: CompletionRequest,
    ) -> Result<Pin<Box<dyn futures::Stream<Item = Result<CompletionChunk>> + Send>>> {
        let registry = self.registry.read().await;
        let provider = registry.get_default_completion_provider().await?;
        drop(registry);

        provider.complete_stream(request).await
    }

    /// Generate embeddings
    #[tracing::instrument(skip(self, request))]
    pub async fn embed(&self, request: EmbeddingsRequest) -> Result<EmbeddingsResponse> {
        // Check cache first
        if let Some(cached) = self.cache.get_embeddings(&request).await {
            tracing::debug!("Cache hit for embeddings request");
            return Ok(cached);
        }

        tracing::debug!("Cache miss for embeddings request");

        // Get provider
        let registry = self.registry.read().await;
        let provider = registry.get_default_embeddings_provider().await?;
        drop(registry);

        // Execute with retry
        let response = crate::services::retry_with_backoff(&self.retry_config, || {
            provider.embed(request.clone())
        })
        .await?;

        // Cache the response
        self.cache
            .put_embeddings(&request, response.clone())
            .await?;

        Ok(response)
    }

    /// List available models
    #[tracing::instrument(skip(self))]
    pub async fn list_models(&self) -> Result<Vec<ModelInfo>> {
        let registry = self.registry.read().await;
        let provider = registry.get_default_chat_provider().await?;
        drop(registry);

        provider.list_models().await
    }

    /// Get model information
    #[tracing::instrument(skip(self))]
    pub async fn get_model_info(&self, model_id: &str) -> Result<ModelInfo> {
        let registry = self.registry.read().await;
        let provider = registry.get_default_chat_provider().await?;
        drop(registry);

        provider.get_model_info(model_id).await
    }

    /// Clear the cache
    pub async fn clear_cache(&self) {
}


/// Get the model registry
pub fn registry(&self) -> &Arc<RwLock<ModelRegistry>> {
    &self.registry
}

/// Get the cache
pub fn cache(&self) -> &Arc<ResponseCache> {
    &self.cache
}

/// Send a chat completion request
#[tracing::instrument(skip(self, request))]
pub async fn chat(&self, request: ChatRequest) -> Result<ChatResponse> {
    // Apply request middleware
    let request = self.middleware.read().await.apply_request_middleware(request).await?;

    let start_time = std::time::Instant::now();
    let provider_name = self.registry.read().await.get_default_chat_provider().await?.name().to_string();

    // Check cache first
    if let Some(cached) = self.cache.get_chat(&request).await {
        tracing::debug!("Cache hit for chat request");
        return Ok(cached);
    }

    tracing::debug!("Cache miss for chat request");

    // Get provider
    let registry = self.registry.read().await;
    let provider = registry.get_default_chat_provider().await?;
    drop(registry);

    // Execute with retry
    let response = crate::services::retry_with_backoff(&self.retry_config, || {
        provider.chat(request.clone())
    })
    .await?;

    // Apply response middleware
    let response = self.middleware.read().await.apply_response_middleware(response).await?;

    // Cache the response
    self.cache.put_chat(&request, &response).await?;

    // Calculate cost
    let cost = self.cost_tracker.calculate_cost(&response).await.ok();

    // Log the request
    self.analytics.log(LogEntry {
        timestamp: std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs(),
        provider: provider_name,
        model: request.model.clone(),
        request_type: "chat".to_string(),
        latency: start_time.elapsed(),
        tokens_used: Some((response.usage.prompt_tokens, response.usage.completion_tokens)),
        cost,
        is_error: false,
        error_message: None,
    });

    Ok(response)
}

/// Send a chat completion request with streaming
#[tracing::instrument(skip(self, request))]
pub async fn chat_stream(
    &self,
    request: ChatRequest,
) -> Result<Pin<Box<dyn futures::Stream<Item = Result<ChatChunk>> + Send>>> {
    let registry = self.registry.read().await;
    let provider = registry.get_default_chat_provider().await?;
    drop(registry);

    provider.chat_stream(request).await
}

/// Send a text completion request
#[tracing::instrument(skip(self, request))]
pub async fn complete(&self, request: CompletionRequest) -> Result<CompletionResponse> {
    // Check cache first
    if let Some(cached) = self.cache.get_completion(&request).await {
        tracing::debug!("Cache hit for completion request");
        return Ok(cached);
    }

    tracing::debug!("Cache miss for completion request");

    // Get provider
    let registry = self.registry.read().await;
    let provider = registry.get_default_completion_provider().await?;
    drop(registry);

    // Execute with retry
    let response = crate::services::retry_with_backoff(&self.retry_config, || {
        provider.complete(request.clone())
    })
    .await?;

    // Cache the response
    self.cache
        .put_completion(&request, response.clone())
        .await?;

    Ok(response)
}

/// Send a text completion request with streaming
#[tracing::instrument(skip(self, request))]
pub async fn complete_stream(
    &self,
    request: CompletionRequest,
) -> Result<Pin<Box<dyn futures::Stream<Item = Result<CompletionChunk>> + Send>>> {
    let registry = self.registry.read().await;
    let provider = registry.get_default_completion_provider().await?;
    drop(registry);

    provider.complete_stream(request).await
}

/// Generate embeddings
#[tracing::instrument(skip(self, request))]
pub async fn embed(&self, request: EmbeddingsRequest) -> Result<EmbeddingsResponse> {
    // Check cache first
    if let Some(cached) = self.cache.get_embeddings(&request).await {
        tracing::debug!("Cache hit for embeddings request");
        return Ok(cached);
    }

    tracing::debug!("Cache miss for embeddings request");

    // Get provider
    let registry = self.registry.read().await;
    let provider = registry.get_default_embeddings_provider().await?;
    drop(registry);

    // Execute with retry
    let response = crate::services::retry_with_backoff(&self.retry_config, || {
        provider.embed(request.clone())
    })
    .await?;

    // Cache the response
    self.cache
        .put_embeddings(&request, response.clone())
        .await?;

    Ok(response)
}

/// List available models
#[tracing::instrument(skip(self))]
pub async fn list_models(&self) -> Result<Vec<ModelInfo>> {
    let registry = self.registry.read().await;
    let provider = registry.get_default_chat_provider().await?;
    drop(registry);

    provider.list_models().await
}

/// Get model information
#[tracing::instrument(skip(self))]
pub async fn get_model_info(&self, model_id: &str) -> Result<ModelInfo> {
    let registry = self.registry.read().await;
    let provider = registry.get_default_chat_provider().await?;
    drop(registry);

    provider.get_model_info(model_id).await
}

/// Clear the cache
pub async fn clear_cache(&self) {
    self.cache.clear().await;
    tracing::info!("Cache cleared");
}

/// Get cache statistics
pub async fn cache_stats(&self) -> crate::services::cache::CacheStats {
    self.cache.stats().await
}

/// Moderate content using the default moderation provider.
#[tracing::instrument(skip(self, request))]
pub async fn moderate(&self, request: ModerationRequest) -> Result<ModerationResponse> {
    let registry = self.registry.read().await;
    let provider = registry.get_default_moderation_provider().await?;
    drop(registry);

    provider.moderate(request).await
}

/// Generate an image using the default image generation provider.
#[tracing::instrument(skip(self, request))]
pub async fn generate_image(&self, request: ImageRequest) -> Result<ImageResponse> {
    let registry = self.registry.read().await;
    let provider = registry.get_default_image_provider().await?;
    drop(registry);

    provider.generate_image(request).await
}
}
