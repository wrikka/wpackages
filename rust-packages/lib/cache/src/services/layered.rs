use async_trait::async_trait;
use std::hash::Hash;

use crate::config::CacheConfig;
use crate::error::{CacheError, CacheResult};
use crate::services::{DiskCache, InMemoryCache};
use crate::types::traits::{Cache, CacheBackend};
use crate::utils::CacheMetrics;

pub struct LayeredCache<K, V> {
    memory: crate::services::InMemoryCache<K, V>,
    disk: crate::services::DiskCache<K, V>,
    metrics: CacheMetrics,
}

impl<K, V> LayeredCache<K, V>
where
    K: Send
        + Sync
        + Hash
        + Eq
        + std::fmt::Debug
        + serde::Serialize
        + for<'de> serde::Deserialize<'de>
        + 'static
        + Clone,
    V: Send + Sync + Clone + serde::Serialize + for<'de> serde::Deserialize<'de> + 'static,
{
    pub fn new(config: &CacheConfig) -> CacheResult<LayeredCache<K, V>> {
        let memory: InMemoryCache<K, V> = InMemoryCache::new(config);
        let disk: DiskCache<K, V> = DiskCache::new(config)?;

        let metrics = if config.enable_metrics {
            CacheMetrics::new(config.max_capacity)
        } else {
            CacheMetrics::default()
        };

        Ok(Self {
            memory,
            disk,
            metrics,
        })
    }

    pub fn builder() -> LayeredCacheBuilder<K, V> {
        LayeredCacheBuilder::new()
    }
}

impl<K, V> CacheBackend for LayeredCache<K, V>
where
    K: Send
        + Sync
        + Hash
        + Eq
        + std::fmt::Debug
        + serde::Serialize
        + for<'de> serde::Deserialize<'de>
        + 'static
        + Clone,
    V: Send + Sync + Clone + serde::Serialize + for<'de> serde::Deserialize<'de> + 'static,
{
    fn name(&self) -> &str {
        "layered"
    }

    fn is_persistent(&self) -> bool {
        true
    }

    fn metrics(&self) -> CacheMetrics {
        self.metrics.clone()
    }
}

#[async_trait]
impl<K, V> Cache<K, V> for LayeredCache<K, V>
where
    K: Send
        + Sync
        + Hash
        + Eq
        + std::fmt::Debug
        + serde::Serialize
        + for<'de> serde::Deserialize<'de>
        + 'static
        + Clone,
    V: Send + Sync + Clone + serde::Serialize + for<'de> serde::Deserialize<'de> + 'static,
{
    async fn get(&self, key: &K) -> CacheResult<Option<V>> {
        if let Some(value) = self.memory.get(key).await? {
            self.metrics.record_hit();
            Ok(Some(value))
        } else if let Some(value) = self.disk.get(key).await? {
            self.memory.set(key.clone(), value.clone()).await?;
            self.metrics.record_hit();
            Ok(Some(value))
        } else {
            self.metrics.record_miss();
            Ok(None)
        }
    }

    async fn set(&self, key: K, value: V) -> CacheResult<()> {
        self.memory.set(key.clone(), value.clone()).await?;
        self.disk.set(key, value).await?;
        Ok(())
    }

    async fn invalidate(&self, key: &K) -> CacheResult<()> {
        self.memory.invalidate(key).await?;
        self.disk.invalidate(key).await?;
        Ok(())
    }

    async fn remove(&self, key: &K) -> CacheResult<()> {
        self.memory.remove(key).await?;
        self.disk.remove(key).await?;
        Ok(())
    }

    async fn clear(&self) -> CacheResult<()> {
        self.memory.clear().await?;
        self.disk.clear().await?;
        Ok(())
    }

    async fn contains(&self, key: &K) -> CacheResult<bool> {
        if self.memory.contains(key).await? {
            Ok(true)
        } else {
            self.disk.contains(key).await
        }
    }

    async fn size(&self) -> CacheResult<usize> {
        Ok(self.memory.size().await?)
    }

    async fn is_empty(&self) -> CacheResult<bool> {
        self.memory.is_empty().await
    }
}

pub struct LayeredCacheBuilder<K, V> {
    path: Option<String>,
    max_capacity: Option<usize>,
    ttl: Option<std::time::Duration>,
    ttl_idle: Option<std::time::Duration>,
    enable_metrics: bool,
    _phantom: std::marker::PhantomData<(K, V)>,
}

impl<K, V> LayeredCacheBuilder<K, V>
where
    K: Send
        + Sync
        + Hash
        + Eq
        + std::fmt::Debug
        + serde::Serialize
        + for<'de> serde::Deserialize<'de>
        + 'static
        + Clone,
    V: Send + Sync + Clone + serde::Serialize + for<'de> serde::Deserialize<'de> + 'static,
{
    pub fn new() -> Self {
        Self {
            path: None,
            max_capacity: None,
            ttl: None,
            ttl_idle: None,
            enable_metrics: true,
            _phantom: std::marker::PhantomData,
        }
    }

    pub fn path(mut self, path: String) -> Self {
        self.path = Some(path);
        self
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

    pub fn build(self) -> CacheResult<LayeredCache<K, V>> {
        let path = self
            .path
            .ok_or_else(|| CacheError::InvalidConfig("Layered cache requires path".to_string()))?;

        let config = CacheConfig {
            backend: crate::config::CacheBackendType::Disk { path },
            max_capacity: self.max_capacity.unwrap_or(1000),
            ttl: self.ttl,
            ttl_idle: self.ttl_idle,
            eviction_policy: crate::config::EvictionPolicy::Lru,
            enable_metrics: self.enable_metrics,
            namespace: None,
        };

        LayeredCache::new(&config)
    }
}

impl<K, V> Default for LayeredCacheBuilder<K, V>
where
    K: Send
        + Sync
        + Hash
        + Eq
        + std::fmt::Debug
        + serde::Serialize
        + for<'de> serde::Deserialize<'de>
        + 'static
        + Clone,
    V: Send + Sync + Clone + serde::Serialize + for<'de> serde::Deserialize<'de> + 'static,
{
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[tokio::test]
    async fn test_layered_cache_basic() {
        let temp_dir = TempDir::new().unwrap();
        let path = temp_dir
            .path()
            .join("cache.db")
            .to_str()
            .unwrap()
            .to_string();

        let cache = LayeredCache::<String, String>::builder()
            .path(path)
            .max_capacity(100)
            .build()
            .unwrap();

        cache
            .set("key1".to_string(), "value1".to_string())
            .await
            .unwrap();
        let result = cache.get(&"key1".to_string()).await.unwrap();

        assert_eq!(result, Some("value1".to_string()));
    }

    #[tokio::test]
    async fn test_layered_cache_promotion() {
        let temp_dir = TempDir::new().unwrap();
        let path = temp_dir
            .path()
            .join("cache.db")
            .to_str()
            .unwrap()
            .to_string();

        let cache = LayeredCache::<String, String>::builder()
            .path(path)
            .max_capacity(100)
            .build()
            .unwrap();

        cache
            .set("key1".to_string(), "value1".to_string())
            .await
            .unwrap();

        let metrics = cache.metrics();
        assert_eq!(metrics.hits(), 0);

        let result = cache.get(&"key1".to_string()).await.unwrap();
        assert_eq!(result, Some("value1".to_string()));

        let metrics = cache.metrics();
        assert_eq!(metrics.hits(), 1);
    }
}
