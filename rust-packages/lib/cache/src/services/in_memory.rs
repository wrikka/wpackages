use async_trait::async_trait;
use moka::future::Cache as MokaCache;
use serde::{Deserialize, Serialize};

use super::super::config::CacheConfig;
use super::super::error::CacheResult;
use super::super::types::traits::{Cache, CacheBackend};
use super::super::utils::CacheMetrics;

pub struct InMemoryCache<K, V> {
    cache: MokaCache<K, V>,
    metrics: CacheMetrics,
}

impl<K, V> InMemoryCache<K, V>
where
    K: Send
        + Sync
        + std::hash::Hash
        + Eq
        + std::fmt::Debug
        + Clone
        + Serialize
        + for<'de> Deserialize<'de>
        + 'static,
    V: Send + Sync + Clone + serde::Serialize + for<'de> serde::Deserialize<'de> + 'static,
{
    pub fn new(config: &CacheConfig) -> Self {
        let mut builder = MokaCache::builder().max_capacity(config.max_capacity as u64);

        if let Some(ttl) = config.ttl {
            builder = builder.time_to_live(ttl);
        }

        if let Some(ttl_idle) = config.ttl_idle {
            builder = builder.time_to_idle(ttl_idle);
        }

        let cache = builder.build();

        let metrics = if config.enable_metrics {
            CacheMetrics::new(config.max_capacity)
        } else {
            CacheMetrics::default()
        };

        Self { cache, metrics }
    }

    pub fn builder() -> InMemoryCacheBuilder<K, V> {
        InMemoryCacheBuilder::new()
    }
}

impl<K, V> CacheBackend for InMemoryCache<K, V>
where
    K: Send + Sync + std::hash::Hash + Eq + std::fmt::Debug + 'static,
    V: Send + Sync + Clone + 'static,
{
    fn name(&self) -> &str {
        "in-memory"
    }

    fn is_persistent(&self) -> bool {
        false
    }

    fn metrics(&self) -> CacheMetrics {
        self.metrics.clone()
    }
}

#[async_trait]
impl<K, V> Cache<K, V> for InMemoryCache<K, V>
where
    K: Send
        + Sync
        + std::hash::Hash
        + Eq
        + std::fmt::Debug
        + Clone
        + Serialize
        + for<'de> Deserialize<'de>
        + 'static,
    V: Send + Sync + Clone + serde::Serialize + for<'de> serde::Deserialize<'de> + 'static,
{
    async fn get(&self, key: &K) -> CacheResult<Option<V>> {
        if let Some(value) = self.cache.get(key).await {
            self.metrics.record_hit();
            Ok(Some(value))
        } else {
            self.metrics.record_miss();
            Ok(None)
        }
    }

    async fn set(&self, key: K, value: V) -> CacheResult<()> {
        self.cache.insert(key, value).await;
        self.metrics
            .update_size(self.cache.entry_count().try_into().unwrap());
        Ok(())
    }

    async fn invalidate(&self, key: &K) -> CacheResult<()> {
        self.cache.invalidate(key).await;
        self.metrics
            .update_size(self.cache.entry_count().try_into().unwrap());
        Ok(())
    }

    async fn remove(&self, key: &K) -> CacheResult<()> {
        self.cache.remove(key).await;
        self.metrics
            .update_size(self.cache.entry_count().try_into().unwrap());
        Ok(())
    }

    async fn clear(&self) -> CacheResult<()> {
        self.cache.invalidate_all();
        self.metrics.update_size(0);
        Ok(())
    }

    async fn contains(&self, key: &K) -> CacheResult<bool> {
        Ok(self.cache.contains_key(key))
    }

    async fn size(&self) -> CacheResult<usize> {
        Ok(self.cache.entry_count().try_into().unwrap())
    }

    async fn is_empty(&self) -> CacheResult<bool> {
        Ok(self.cache.entry_count() == 0)
    }
}

pub struct InMemoryCacheBuilder<K, V> {
    max_capacity: Option<usize>,
    ttl: Option<std::time::Duration>,
    ttl_idle: Option<std::time::Duration>,
    enable_metrics: bool,
    _phantom: std::marker::PhantomData<(K, V)>,
}

impl<K, V> InMemoryCacheBuilder<K, V>
where
    K: Send
        + Sync
        + std::hash::Hash
        + Eq
        + std::fmt::Debug
        + Clone
        + Serialize
        + for<'de> Deserialize<'de>
        + 'static,
    V: Send + Sync + Clone + Serialize + for<'de> Deserialize<'de> + 'static,
{
    pub fn new() -> Self {
        Self {
            max_capacity: None,
            ttl: None,
            ttl_idle: None,
            enable_metrics: true,
            _phantom: std::marker::PhantomData,
        }
    }

    pub fn max_capacity(mut self, capacity: usize) -> Self {
        self.max_capacity = Some(capacity);
        self
    }

    pub fn ttl(mut self, duration: std::time::Duration) -> Self {
        self.ttl = Some(duration);
        self
    }

    pub fn ttl_idle(mut self, duration: std::time::Duration) -> Self {
        self.ttl_idle = Some(duration);
        self
    }

    pub fn enable_metrics(mut self, enable: bool) -> Self {
        self.enable_metrics = enable;
        self
    }

    pub fn build(self) -> InMemoryCache<K, V> {
        let config = CacheConfig {
            backend: crate::config::CacheBackendType::InMemory,
            max_capacity: self.max_capacity.unwrap_or(1000),
            ttl: self.ttl,
            ttl_idle: self.ttl_idle,
            eviction_policy: crate::config::EvictionPolicy::None,
            enable_metrics: self.enable_metrics,
            namespace: None,
        };

        InMemoryCache::new(&config)
    }
}

impl<K, V> Default for InMemoryCacheBuilder<K, V>
where
    K: Send
        + Sync
        + std::hash::Hash
        + Eq
        + std::fmt::Debug
        + Clone
        + Serialize
        + for<'de> Deserialize<'de>
        + 'static,
    V: Send + Sync + Clone + Serialize + for<'de> Deserialize<'de> + 'static,
{
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::Duration;

    #[tokio::test]
    async fn test_in_memory_cache_basic() {
        let cache = InMemoryCache::<String, String>::builder()
            .max_capacity(100)
            .build();

        cache
            .set("key1".to_string(), "value1".to_string())
            .await
            .unwrap();
        let result = cache.get(&"key1".to_string()).await.unwrap();

        assert_eq!(result, Some("value1".to_string()));
    }

    #[tokio::test]
    async fn test_in_memory_cache_remove() {
        let cache = InMemoryCache::<String, String>::builder()
            .max_capacity(100)
            .build();

        cache
            .set("key1".to_string(), "value1".to_string())
            .await
            .unwrap();
        cache.remove(&"key1".to_string()).await.unwrap();

        let result = cache.get(&"key1".to_string()).await.unwrap();
        assert_eq!(result, None);
    }

    #[tokio::test]
    async fn test_in_memory_cache_clear() {
        let cache = InMemoryCache::<String, String>::builder()
            .max_capacity(100)
            .build();

        cache
            .set("key1".to_string(), "value1".to_string())
            .await
            .unwrap();
        cache
            .set("key2".to_string(), "value2".to_string())
            .await
            .unwrap();
        cache.clear().await.unwrap();

        assert!(cache.is_empty().await.unwrap());
    }

    #[tokio::test]
    async fn test_in_memory_cache_size() {
        let cache = InMemoryCache::<String, String>::builder()
            .max_capacity(100)
            .build();

        cache
            .set("key1".to_string(), "value1".to_string())
            .await
            .unwrap();
        cache
            .set("key2".to_string(), "value2".to_string())
            .await
            .unwrap();

        assert_eq!(cache.size().await.unwrap(), 2);
    }

    #[tokio::test]
    async fn test_in_memory_cache_metrics() {
        let cache = InMemoryCache::<String, String>::builder()
            .max_capacity(100)
            .build();

        cache
            .set("key1".to_string(), "value1".to_string())
            .await
            .unwrap();
        cache.get(&"key1".to_string()).await.unwrap();
        cache.get(&"key2".to_string()).await.unwrap();

        let metrics = cache.metrics();
        assert_eq!(metrics.hits(), 1);
        assert_eq!(metrics.misses(), 1);
    }

    #[tokio::test]
    async fn test_in_memory_cache_ttl() {
        let cache = InMemoryCache::<String, String>::builder()
            .max_capacity(100)
            .ttl(Duration::from_millis(100))
            .build();

        cache
            .set("key1".to_string(), "value1".to_string())
            .await
            .unwrap();
        assert_eq!(
            cache.get(&"key1".to_string()).await.unwrap(),
            Some("value1".to_string())
        );

        tokio::time::sleep(Duration::from_millis(150)).await;
        assert_eq!(cache.get(&"key1".to_string()).await.unwrap(), None);
    }
}
