use crate::types::Embedding;
use cache::prelude::*;
use std::sync::Arc;
use std::time::Duration;

/// A service for caching embeddings.
pub struct CacheService {
    cache: Arc<cache::InMemoryCache<String, Embedding>>,
}

impl CacheService {
    /// Creates a new CacheService.
    pub fn new(capacity: u64, ttl_secs: u64) -> Self {
        let cache_config = CacheConfig::builder()
            .backend(cache::config::CacheBackendType::InMemory)
            .max_capacity(capacity as usize)
            .ttl(Duration::from_secs(ttl_secs))
            .enable_metrics(true)
            .build();
        let cache = Arc::new(cache::InMemoryCache::new(&cache_config));
        Self { cache }
    }

    /// Gets an embedding from the cache.
    pub async fn get(&self, key: &str) -> Option<Embedding> {
        self.cache.get(key).await.ok().flatten()
    }

    /// Puts an embedding into the cache.
    pub async fn put(&self, key: String, value: Embedding) {
        let _ = self.cache.put(key, value, None).await;
    }

    /// Clears the cache.
    pub async fn clear(&self) {
        let _ = self.cache.clear().await;
    }
}
