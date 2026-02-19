//! Services Layer
//!
//! Effect Layer: จัดการ I/O (ผ่าน Traits)

pub mod cache;
pub mod rate_limiter;
pub mod streaming;

pub use cache::{CacheKey, CompletionCache, InMemoryCache};
pub use rate_limiter::*;
pub use streaming::*;

use crate::adapters::model_provider::ModelProvider;
use crate::components::context_window::ContextWindowManager;
use crate::config::CompletionConfig;
use crate::error::{CompletionError, CompletionResult};
use crate::services::rate_limiter::*;
use crate::types::*;
use async_trait::async_trait;
use std::future::Future;
use std::sync::Arc;
use tokio::sync::RwLock;
use validator::Validate;

#[async_trait]
pub trait CompletionClient: Send + Sync {
    async fn get_completion(
        &self,
        request: CompletionRequest,
    ) -> CompletionResult<CompletionResponse>;
    async fn debug_code(&self, request: DebugRequest) -> CompletionResult<DebugResponse>;
    async fn refactor_code(&self, request: RefactorRequest) -> CompletionResult<RefactorResponse>;
    async fn get_config(&self) -> CompletionResult<CompletionConfig>;
    async fn set_config(&self, config: CompletionConfig) -> CompletionResult<()>;
    async fn is_ready(&self) -> CompletionResult<bool>;
}

pub struct CompletionService {
    config: Arc<RwLock<CompletionConfig>>,
    client: Arc<dyn CompletionClient>,
    cache: Option<Arc<dyn CompletionCache>>,
    rate_limiter: Option<Arc<dyn RateLimiter>>,
    context_manager: ContextWindowManager,
    model_provider: Option<Arc<dyn ModelProvider>>,
}

impl CompletionService {
    pub fn builder(config: CompletionConfig, client: Arc<dyn CompletionClient>) -> CompletionServiceBuilder {
        CompletionServiceBuilder::new(config, client)
    }

    pub fn with_model_provider(mut self, provider: Arc<dyn ModelProvider>) -> Self {
        self.model_provider = Some(provider);
        self
    }

    async fn handle_request<
        Req: Send + Sync + Validate,
        Resp: Clone + Send + Sync,
        CacheGetFut: Future<Output = CompletionResult<Option<Resp>>>,
        CacheSetFut: Future<Output = CompletionResult<()>>,
        ClientFut: Future<Output = CompletionResult<Resp>>,
    >(
        &self,
        req: Req,
        cache_key_fn: impl Fn(&Req) -> CacheKey,
        cache_get_fn: impl Fn(Arc<dyn CompletionCache>, &CacheKey) -> CacheGetFut,
        cache_set_fn: impl Fn(Arc<dyn CompletionCache>, CacheKey, Resp) -> CacheSetFut,
        client_fn: impl Fn(Arc<dyn CompletionClient>, Req) -> ClientFut,
    ) -> CompletionResult<Resp> {
        req.validate()?;
        if let Some(rl) = &self.rate_limiter {
            if !rl.check_rate_limit("default").await?.allowed {
                return Err(CompletionError::RateLimit("Rate limit exceeded".to_string()));
            }
        }

        let cache_key = cache_key_fn(&req);
        if let Some(cache) = &self.cache {
            if let Some(cached) = cache_get_fn(cache.clone(), &cache_key).await? {
                return Ok(cached);
            }
        }

        self.client.is_ready().await?;

        let response = client_fn(self.client.clone(), req).await?;

        if let Some(cache) = &self.cache {
            let _ = cache_set_fn(cache.clone(), cache_key, response.clone()).await;
        }

        Ok(response)
    }

    pub async fn complete(
        &self,
        mut request: CompletionRequest,
    ) -> CompletionResult<CompletionResponse> {
        let config = self.config.read().await;
        if request.max_tokens.is_none() {
            request.max_tokens = Some(config.api.max_tokens);
        }
        if request.temperature.is_none() {
            request.temperature = Some(config.api.temperature);
        }
        let request = self.context_manager.truncate_request(request);

        self.handle_request(
            request,
            |req| CacheKey::from_completion_request(req),
            |cache, key| Box::pin(cache.get_completion(key)),
            |cache, key, resp| Box::pin(cache.set_completion(key, resp)),
            |client, req| Box::pin(client.get_completion(req)),
        )
        .await
    }

    pub async fn debug(&self, request: DebugRequest) -> CompletionResult<DebugResponse> {
        self.handle_request(
            request,
            |req| CacheKey::from_debug_request(req),
            |cache, key| Box::pin(cache.get_debug(key)),
            |cache, key, resp| Box::pin(cache.set_debug(key, resp)),
            |client, req| Box::pin(client.debug_code(req)),
        )
        .await
    }

    pub async fn refactor(&self, request: RefactorRequest) -> CompletionResult<RefactorResponse> {
        self.handle_request(
            request,
            |req| CacheKey::from_refactor_request(req),
            |cache, key| Box::pin(cache.get_refactor(key)),
            |cache, key, resp| Box::pin(cache.set_refactor(key, resp)),
            |client, req| Box::pin(client.refactor_code(req)),
        )
        .await
    }

    pub async fn get_config(&self) -> CompletionResult<CompletionConfig> {
        let config = self.config.read().await;
        Ok(config.clone())
    }

    pub async fn set_config(&self, config: CompletionConfig) -> CompletionResult<()> {
        config.validate()?;
        let mut cfg = self.config.write().await;
        *cfg = config;
        Ok(())
    }

    pub async fn is_ready(&self) -> CompletionResult<bool> {
        self.client.is_ready().await
    }
}

pub struct MockCompletionClient {
    ready: bool,
}

impl MockCompletionClient {
    pub fn new(ready: bool) -> Self {
        Self { ready }
    }
}

#[async_trait]
impl CompletionClient for MockCompletionClient {
    async fn get_completion(
        &self,
        request: CompletionRequest,
    ) -> CompletionResult<CompletionResponse> {
        if !self.ready {
            return Err(CompletionError::Model("Client not ready".to_string()));
        }

        let suggestions = vec![CompletionSuggestion::new(
            format!("{}() {{", request.prompt),
            CompletionKind::Function,
        )
        .with_score(0.9)];

        Ok(CompletionResponse::new(
            suggestions,
            "mock-model".to_string(),
        ))
    }

    async fn debug_code(&self, _request: DebugRequest) -> CompletionResult<DebugResponse> {
        if !self.ready {
            return Err(CompletionError::Model("Client not ready".to_string()));
        }

        let suggestions = vec![
            DebugSuggestion::new("Fix the error", "The error is caused by...")
                .with_confidence(0.85),
        ];

        Ok(DebugResponse::new(
            suggestions,
            "Analysis complete".to_string(),
            "mock-model".to_string(),
        ))
    }

    async fn refactor_code(&self, request: RefactorRequest) -> CompletionResult<RefactorResponse> {
        if !self.ready {
            return Err(CompletionError::Model("Client not ready".to_string()));
        }

        Ok(RefactorResponse::new(
            request.code.clone(),
            "Refactoring complete".to_string(),
            "mock-model".to_string(),
        ))
    }

    async fn get_config(&self) -> CompletionResult<CompletionConfig> {
        Ok(CompletionConfig::default())
    }

    async fn set_config(&self, _config: CompletionConfig) -> CompletionResult<()> {
        Ok(())
    }

    async fn is_ready(&self) -> CompletionResult<bool> {
        Ok(self.ready)
    }
}

pub struct CompletionServiceBuilder {
    config: CompletionConfig,
    client: Arc<dyn CompletionClient>,
    cache: Option<Arc<dyn CompletionCache>>,
    rate_limiter: Option<Arc<dyn RateLimiter>>,
    model_provider: Option<Arc<dyn ModelProvider>>,
}

impl CompletionServiceBuilder {
    pub fn new(config: CompletionConfig, client: Arc<dyn CompletionClient>) -> Self {
        Self {
            config,
            client,
            cache: None,
            rate_limiter: None,
            model_provider: None,
        }
    }

    pub fn with_cache(mut self, cache: Arc<dyn CompletionCache>) -> Self {
        self.cache = Some(cache);
        self
    }

    pub fn with_rate_limiter(mut self, rate_limiter: Arc<dyn RateLimiter>) -> Self {
        self.rate_limiter = Some(rate_limiter);
        self
    }

    pub fn with_model_provider(mut self, model_provider: Arc<dyn ModelProvider>) -> Self {
        self.model_provider = Some(model_provider);
        self
    }

    pub fn build(self) -> CompletionService {
        let context_manager = ContextWindowManager::new(self.config.context_window.max_tokens);

        let cache = if self.config.cache.enabled {
            self.cache.or_else(|| {
                Some(Arc::new(
                    InMemoryCache::builder()
                        .with_max_capacity(self.config.cache.max_capacity)
                        .with_ttl(self.config.cache.ttl_seconds)
                        .build(),
                ))
            })
        } else {
            None
        };

        let rate_limiter = if self.config.rate_limit.enabled {
            self.rate_limiter.or_else(|| {
                Some(Arc::new(
                    TokenBucketRateLimiter::builder()
                        .with_capacity(self.config.rate_limit.capacity)
                        .with_refill_rate(std::time::Duration::from_millis(
                            self.config.rate_limit.refill_ms,
                        ))
                        .build(),
                ))
            })
        } else {
            None
        };

        CompletionService {
            config: Arc::new(RwLock::new(self.config)),
            client: self.client,
            cache,
            rate_limiter,
            context_manager,
            model_provider: self.model_provider,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_completion_service() {
        let config = CompletionConfig::default();
        let client = Arc::new(MockCompletionClient::new(true)) as Arc<dyn CompletionClient>;
        let service = CompletionService::builder(config, client).build();

        let request = CompletionRequest::new("fn main", "rust");
        let response = service.complete(request).await.unwrap();

        assert_eq!(response.suggestion_count(), 1);
    }

    #[tokio::test]
    async fn test_completion_service_not_ready() {
        let config = CompletionConfig::default();
        let client = Arc::new(MockCompletionClient::new(false)) as Arc<dyn CompletionClient>;
        let service = CompletionService::builder(config, client).build();

        let request = CompletionRequest::new("fn main", "rust");
        let result = service.complete(request).await;

        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_config_validation() {
        let mut config = CompletionConfig::default();
        config.api.api_key = String::new();
        assert!(config.validate().is_err());

        let mut config = CompletionConfig::default();
        config.api.model = String::new();
        assert!(config.validate().is_err());

        let mut config = CompletionConfig::default();
        config.api.temperature = 3.0;
        assert!(config.validate().is_err());
    }
}
