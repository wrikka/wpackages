//! Caching services for AI model responses.

pub mod backend;
pub mod file_cache;
pub mod in_memory_cache;

pub use self::in_memory_cache::InMemoryCache;
pub use backend::CacheBackend;
pub use file_cache::FileCache;

use crate::error::{AiModelsError, Result};
use crate::types::{ChatRequest, ChatResponse};
use std::sync::Arc;

/// Cache statistics
#[derive(Debug, Clone, Default)]
pub struct CacheStats {
    pub chat_entries: u64,
}


/// A generic response cache that uses a configurable backend for storage.
pub struct ResponseCache {
    backend: Arc<dyn CacheBackend>,
}

impl ResponseCache {
    /// Create a new `ResponseCache` with the given backend.
    pub fn new(backend: Arc<dyn CacheBackend>) -> Self {
        Self { backend }
    }

    /// Generate a cache key from a serializable request.
    fn cache_key(request: &impl serde::Serialize) -> Result<String> {
        let json = serde_json::to_string(request)
            .map_err(|e| AiModelsError::Serialization(e.to_string()))?;
        Ok(format!("{:x}", md5::compute(json.as_bytes())))
    }

    /// Get a cached chat response.
    pub async fn get_chat(&self, request: &ChatRequest) -> Option<ChatResponse> {
        let key = Self::cache_key(request).ok()?;
        self.backend.get_chat(&key).await
    }

    /// Put a chat response into the cache.
    pub async fn put_chat(&self, request: &ChatRequest, response: &ChatResponse) -> Result<()> {
        let key = Self::cache_key(request)?;
        self.backend.put_chat(&key, response).await;
        Ok(())
    }

    /// Clear the cache.
    pub async fn clear(&self) {
        self.backend.clear().await;
    }

    /// Get cache statistics.
    pub async fn stats(&self) -> CacheStats {
        self.backend.stats().await
    }
}
