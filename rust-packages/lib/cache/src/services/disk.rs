use async_trait::async_trait;
use bincode::{deserialize, serialize};
use serde::{Deserialize, Serialize};
use std::hash::Hash;

use crate::config::CacheConfig;
use crate::error::{CacheError, CacheResult};
use crate::types::traits::{Cache, CacheBackend};
use crate::utils::CacheMetrics;

pub struct DiskCache<K, V> {
    db: sled::Db,
    metrics: CacheMetrics,
    _phantom: std::marker::PhantomData<(K, V)>,
}

impl<K, V> DiskCache<K, V>
where
    K: Send + Sync + Hash + Eq + std::fmt::Debug + Serialize + for<'de> Deserialize<'de> + 'static,
    V: Send + Sync + Clone + Serialize + for<'de> Deserialize<'de> + 'static,
{
    pub fn new(config: &CacheConfig) -> CacheResult<Self> {
        let path = match &config.backend {
            crate::config::CacheBackendType::Disk { path } => path,
            _ => {
                return Err(CacheError::InvalidConfig(
                    "Disk cache requires path".to_string(),
                ))
            }
        };

        let db = sled::open(path)?;

        let metrics = if config.enable_metrics {
            CacheMetrics::new(config.max_capacity)
        } else {
            CacheMetrics::default()
        };

        Ok(Self {
            db,
            metrics,
            _phantom: std::marker::PhantomData,
        })
    }

    pub fn builder() -> DiskCacheBuilder<K, V> {
        DiskCacheBuilder::new()
    }

    fn serialize_key(key: &K) -> CacheResult<Vec<u8>> {
        serialize(key).map_err(|e| CacheError::SerializationError(e.to_string()))
    }

    fn serialize_value(value: &V) -> CacheResult<Vec<u8>> {
        serialize(value).map_err(|e| CacheError::SerializationError(e.to_string()))
    }

    fn deserialize_value(data: &[u8]) -> CacheResult<V> {
        deserialize(data).map_err(|e| CacheError::DeserializationError(e.to_string()))
    }
}

impl<K, V> CacheBackend for DiskCache<K, V>
where
    K: Send + Sync + Hash + Eq + std::fmt::Debug + Serialize + for<'de> Deserialize<'de> + 'static,
    V: Send + Sync + Clone + Serialize + for<'de> Deserialize<'de> + 'static,
{
    fn name(&self) -> &str {
        "disk"
    }

    fn is_persistent(&self) -> bool {
        true
    }

    fn metrics(&self) -> CacheMetrics {
        self.metrics.clone()
    }
}

#[async_trait]
impl<K, V> Cache<K, V> for DiskCache<K, V>
where
    K: Send
        + Sync
        + Hash
        + Eq
        + std::fmt::Debug
        + Clone
        + Serialize
        + for<'de> Deserialize<'de>
        + 'static,
    V: Send + Sync + Clone + Serialize + for<'de> Deserialize<'de> + 'static,
{
    async fn get(&self, key: &K) -> CacheResult<Option<V>> {
        let key_bytes = Self::serialize_key(key)?;

        if let Some(value_bytes) = self.db.get(&key_bytes)? {
            let value = Self::deserialize_value(&value_bytes)?;
            self.metrics.record_hit();
            Ok(Some(value))
        } else {
            self.metrics.record_miss();
            Ok(None)
        }
    }

    async fn set(&self, key: K, value: V) -> CacheResult<()> {
        let key_bytes = Self::serialize_key(&key)?;
        let value_bytes = Self::serialize_value(&value)?;
        self.db.insert(&key_bytes, value_bytes)?;
        self.metrics.update_size(self.db.len());
        Ok(())
    }

    async fn invalidate(&self, key: &K) -> CacheResult<()> {
        let key_bytes = Self::serialize_key(key)?;
        self.db.remove(&key_bytes)?;
        self.metrics.update_size(self.db.len());
        Ok(())
    }

    async fn remove(&self, key: &K) -> CacheResult<()> {
        let key_bytes = Self::serialize_key(key)?;
        self.db.remove(&key_bytes)?;
        self.metrics.update_size(self.db.len());
        Ok(())
    }

    async fn clear(&self) -> CacheResult<()> {
        self.db.clear()?;
        self.metrics.update_size(0);
        Ok(())
    }

    async fn contains(&self, key: &K) -> CacheResult<bool> {
        let key_bytes = Self::serialize_key(key)?;
        Ok(self.db.contains_key(&key_bytes)?)
    }

    async fn size(&self) -> CacheResult<usize> {
        Ok(self.db.len())
    }

    async fn is_empty(&self) -> CacheResult<bool> {
        Ok(self.db.is_empty())
    }
}

pub struct DiskCacheBuilder<K, V> {
    path: Option<String>,
    _phantom: std::marker::PhantomData<(K, V)>,
}

impl<K, V> DiskCacheBuilder<K, V>
where
    K: Send + Sync + Hash + Eq + std::fmt::Debug + Serialize + for<'de> Deserialize<'de> + 'static,
    V: Send + Sync + Clone + Serialize + for<'de> Deserialize<'de> + 'static,
{
    pub fn new() -> Self {
        Self {
            path: None,
            _phantom: std::marker::PhantomData,
        }
    }

    pub fn path(mut self, path: String) -> Self {
        self.path = Some(path);
        self
    }

    pub fn build(self) -> CacheResult<DiskCache<K, V>> {
        let path = self
            .path
            .ok_or_else(|| CacheError::InvalidConfig("Disk cache requires path".to_string()))?;

        let config = CacheConfig {
            backend: crate::config::CacheBackendType::Disk { path },
            max_capacity: 10000,
            ttl: None,
            ttl_idle: None,
            eviction_policy: crate::config::EvictionPolicy::None,
            enable_metrics: true,
            namespace: None,
        };

        DiskCache::new(&config)
    }
}

impl<K, V> Default for DiskCacheBuilder<K, V>
where
    K: Send + Sync + Hash + Eq + std::fmt::Debug + Serialize + for<'de> Deserialize<'de> + 'static,
    V: Send + Sync + Clone + Serialize + for<'de> Deserialize<'de> + 'static,
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
    async fn test_disk_cache_basic() {
        let temp_dir = TempDir::new().unwrap();
        let path = temp_dir
            .path()
            .join("cache.db")
            .to_str()
            .unwrap()
            .to_string();

        let cache = DiskCache::<String, String>::builder()
            .path(path)
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
    async fn test_disk_cache_persistence() {
        let temp_dir = TempDir::new().unwrap();
        let path = temp_dir
            .path()
            .join("cache.db")
            .to_str()
            .unwrap()
            .to_string();

        {
            let cache = DiskCache::<String, String>::builder()
                .path(path.clone())
                .build()
                .unwrap();

            cache
                .set("key1".to_string(), "value1".to_string())
                .await
                .unwrap();
        }

        {
            let cache = DiskCache::<String, String>::builder()
                .path(path)
                .build()
                .unwrap();

            let result = cache.get(&"key1".to_string()).await.unwrap();
            assert_eq!(result, Some("value1".to_string()));
        }
    }

    #[tokio::test]
    async fn test_disk_cache_remove() {
        let temp_dir = TempDir::new().unwrap();
        let path = temp_dir
            .path()
            .join("cache.db")
            .to_str()
            .unwrap()
            .to_string();

        let cache = DiskCache::<String, String>::builder()
            .path(path)
            .build()
            .unwrap();

        cache
            .set("key1".to_string(), "value1".to_string())
            .await
            .unwrap();
        cache.remove(&"key1".to_string()).await.unwrap();

        let result = cache.get(&"key1".to_string()).await.unwrap();
        assert_eq!(result, None);
    }

    #[tokio::test]
    async fn test_disk_cache_clear() {
        let temp_dir = TempDir::new().unwrap();
        let path = temp_dir
            .path()
            .join("cache.db")
            .to_str()
            .unwrap()
            .to_string();

        let cache = DiskCache::<String, String>::builder()
            .path(path)
            .build()
            .unwrap();

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
    async fn test_disk_cache_size() {
        let temp_dir = TempDir::new().unwrap();
        let path = temp_dir
            .path()
            .join("cache.db")
            .to_str()
            .unwrap()
            .to_string();

        let cache = DiskCache::<String, String>::builder()
            .path(path)
            .build()
            .unwrap();

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
    async fn test_disk_cache_metrics() {
        let temp_dir = TempDir::new().unwrap();
        let path = temp_dir
            .path()
            .join("cache.db")
            .to_str()
            .unwrap()
            .to_string();

        let cache = DiskCache::<String, String>::builder()
            .path(path)
            .build()
            .unwrap();

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
}
