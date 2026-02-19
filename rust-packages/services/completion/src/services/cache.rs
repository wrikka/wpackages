//! Cache module for completion service
//!
//! Provides caching functionality for completion, debug, and refactor operations

use crate::error::CompletionResult;
use crate::types::{
    CompletionRequest, CompletionResponse, DebugRequest, DebugResponse, RefactorRequest,
    RefactorResponse,
};
use async_trait::async_trait;
use cache::prelude::*;
use cache::CacheBackend;
use serde::{Deserialize, Serialize};
use std::hash::Hash;

#[derive(Debug, Clone, Serialize, Deserialize, Hash, Eq, PartialEq)]
pub struct CacheKey {
    pub request_type: RequestType,
    pub prompt: String,
    pub language: String,
    pub max_tokens: Option<usize>,
    pub temperature_bits: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Hash, Eq, PartialEq)]
pub enum RequestType {
    Completion,
    Debug,
    Refactor,
}

impl CacheKey {
    pub fn from_completion_request(request: &CompletionRequest) -> Self {
        Self {
            request_type: RequestType::Completion,
            prompt: request.prompt.clone(),
            language: request.language.clone(),
            max_tokens: request.max_tokens,
            temperature_bits: request.temperature.map(|t| t.to_bits()),
        }
    }

    pub fn from_debug_request(request: &DebugRequest) -> Self {
        Self {
            request_type: RequestType::Debug,
            prompt: request.code.clone(),
            language: request.language.clone(),
            max_tokens: None,
            temperature_bits: None,
        }
    }

    pub fn from_refactor_request(request: &RefactorRequest) -> Self {
        Self {
            request_type: RequestType::Refactor,
            prompt: request.code.clone(),
            language: request.language.clone(),
            max_tokens: None,
            temperature_bits: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheValue {
    pub completion_response: Option<CompletionResponse>,
    pub debug_response: Option<DebugResponse>,
    pub refactor_response: Option<RefactorResponse>,
    pub timestamp: u64,
}

impl CacheValue {
    pub fn from_completion_response(response: CompletionResponse) -> Self {
        Self {
            completion_response: Some(response),
            debug_response: None,
            refactor_response: None,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        }
    }

    pub fn from_debug_response(response: DebugResponse) -> Self {
        Self {
            completion_response: None,
            debug_response: Some(response),
            refactor_response: None,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        }
    }

    pub fn from_refactor_response(response: RefactorResponse) -> Self {
        Self {
            completion_response: None,
            debug_response: None,
            refactor_response: Some(response),
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        }
    }
}

#[async_trait]
pub trait CompletionCache: Send + Sync {
    async fn get_completion(&self, key: &CacheKey) -> CompletionResult<Option<CompletionResponse>>;
    async fn set_completion(
        &self,
        key: CacheKey,
        value: CompletionResponse,
    ) -> CompletionResult<()>;
    async fn get_debug(&self, key: &CacheKey) -> CompletionResult<Option<DebugResponse>>;
    async fn set_debug(&self, key: CacheKey, value: DebugResponse) -> CompletionResult<()>;
    async fn get_refactor(&self, key: &CacheKey) -> CompletionResult<Option<RefactorResponse>>;
    async fn set_refactor(&self, key: CacheKey, value: RefactorResponse) -> CompletionResult<()>;
    async fn clear(&self) -> CompletionResult<()>;
    async fn invalidate(&self, key: &CacheKey) -> CompletionResult<()>;
}

pub struct InMemoryCache {
    cache: cache::InMemoryCache<CacheKey, CacheValue>,
}

impl InMemoryCache {
    pub fn new(max_capacity: u64, ttl_seconds: u64) -> Self {
        let config = CacheConfig::builder()
            .backend(cache::config::CacheBackendType::InMemory)
            .max_capacity(max_capacity as usize)
            .ttl(std::time::Duration::from_secs(ttl_seconds))
            .enable_metrics(true)
            .build();

        Self {
            cache: cache::InMemoryCache::new(&config),
        }
    }

    pub fn builder() -> InMemoryCacheBuilder {
        InMemoryCacheBuilder::new()
    }

    pub fn metrics(&self) -> CacheMetrics {
        self.cache.metrics()
    }
}

pub struct InMemoryCacheBuilder {
    max_capacity: u64,
    ttl_seconds: u64,
}

impl InMemoryCacheBuilder {
    pub fn new() -> Self {
        Self {
            max_capacity: 1000,
            ttl_seconds: 3600,
        }
    }

    pub fn with_max_capacity(mut self, capacity: u64) -> Self {
        self.max_capacity = capacity;
        self
    }

    pub fn with_ttl(mut self, seconds: u64) -> Self {
        self.ttl_seconds = seconds;
        self
    }

    pub fn build(self) -> InMemoryCache {
        InMemoryCache::new(self.max_capacity, self.ttl_seconds)
    }
}

#[async_trait]
impl CompletionCache for InMemoryCache {
    async fn get_completion(&self, key: &CacheKey) -> CompletionResult<Option<CompletionResponse>> {
        Ok(self
            .cache
            .get(key)
            .await?
            .and_then(|v| v.completion_response))
    }

    async fn set_completion(
        &self,
        key: CacheKey,
        value: CompletionResponse,
    ) -> CompletionResult<()> {
        self.cache
            .set(key, CacheValue::from_completion_response(value))
            .await?;
        Ok(())
    }

    async fn get_debug(&self, key: &CacheKey) -> CompletionResult<Option<DebugResponse>> {
        Ok(self.cache.get(key).await?.and_then(|v| v.debug_response))
    }

    async fn set_debug(&self, key: CacheKey, value: DebugResponse) -> CompletionResult<()> {
        self.cache
            .set(key, CacheValue::from_debug_response(value))
            .await?;
        Ok(())
    }

    async fn get_refactor(&self, key: &CacheKey) -> CompletionResult<Option<RefactorResponse>> {
        Ok(self.cache.get(key).await?.and_then(|v| v.refactor_response))
    }

    async fn set_refactor(&self, key: CacheKey, value: RefactorResponse) -> CompletionResult<()> {
        self.cache
            .set(key, CacheValue::from_refactor_response(value))
            .await?;
        Ok(())
    }

    async fn clear(&self) -> CompletionResult<()> {
        self.cache.clear().await?;
        Ok(())
    }

    async fn invalidate(&self, key: &CacheKey) -> CompletionResult<()> {
        self.cache.remove(key).await?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_cache_key_creation() {
        let request = CompletionRequest::new("fn main", "rust");
        let key = CacheKey::from_completion_request(&request);

        assert_eq!(key.request_type, RequestType::Completion);
        assert_eq!(key.prompt, "fn main");
        assert_eq!(key.language, "rust");
    }

    #[tokio::test]
    async fn test_in_memory_cache_completion() {
        let cache = InMemoryCache::builder().build();
        let key = CacheKey::from_completion_request(&CompletionRequest::new("test", "rust"));
        let response = CompletionResponse::new(vec![], "test-model".to_string());

        cache
            .set_completion(key.clone(), response.clone())
            .await
            .unwrap();
        let cached = cache.get_completion(&key).await.unwrap();

        assert!(cached.is_some());
        assert_eq!(cached.unwrap().model, "test-model");
    }

    #[tokio::test]
    async fn test_in_memory_cache_miss() {
        let cache = InMemoryCache::builder().build();
        let key = CacheKey::from_completion_request(&CompletionRequest::new("test", "rust"));

        let cached = cache.get_completion(&key).await.unwrap();
        assert!(cached.is_none());
    }

    #[tokio::test]
    async fn test_cache_invalidation() {
        let cache = InMemoryCache::builder().build();
        let key = CacheKey::from_completion_request(&CompletionRequest::new("test", "rust"));
        let response = CompletionResponse::new(vec![], "test-model".to_string());

        cache
            .set_completion(key.clone(), response.clone())
            .await
            .unwrap();
        cache.invalidate(&key).await.unwrap();

        let cached = cache.get_completion(&key).await.unwrap();
        assert!(cached.is_none());
    }

    #[tokio::test]
    async fn test_cache_clear() {
        let cache = InMemoryCache::builder().build();
        let key1 = CacheKey::from_completion_request(&CompletionRequest::new("test1", "rust"));
        let key2 = CacheKey::from_completion_request(&CompletionRequest::new("test2", "rust"));
        let response = CompletionResponse::new(vec![], "test-model".to_string());

        cache.set_completion(key1.clone(), response.clone()).await.unwrap();
        cache.set_completion(key2.clone(), response.clone()).await.unwrap();
        cache.clear().await.unwrap();

        assert!(cache.get_completion(&key1).await.unwrap().is_none());
        assert!(cache.get_completion(&key2).await.unwrap().is_none());
    }
}
