use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::hash::Hash;

use crate::config::CacheConfig;
use crate::error::{CacheError, CacheResult};
use crate::types::traits::{Cache, CacheBackend};
use crate::utils::CacheMetrics;

pub struct RedisCache<K, V> {
    client: redis::Client,
    metrics: CacheMetrics,
    _phantom: std::marker::PhantomData<(K, V)>,
}

impl<K, V> RedisCache<K, V>
where
    K: Send + Sync + Hash + Eq + std::fmt::Debug + Serialize + for<'de> Deserialize<'de> + 'static,
    V: Send + Sync + Clone + Serialize + for<'de> Deserialize<'de> + 'static,
{
    pub fn new(config: &CacheConfig) -> CacheResult<Self> {
        let url = match &config.backend {
            crate::config::CacheBackendType::Redis { url } => url,
            _ => {
                return Err(CacheError::InvalidConfig(
                    "Redis cache requires URL".to_string(),
                ))
            }
        };

        let client =
            redis::Client::open(url).map_err(|e| CacheError::ConnectionError(e.to_string()))?;

        let metrics = if config.enable_metrics {
            CacheMetrics::new(config.max_capacity)
        } else {
            CacheMetrics::default()
        };

        Ok(Self {
            client,
            metrics,
            _phantom: std::marker::PhantomData,
        })
    }

    pub fn builder() -> RedisCacheBuilder<K, V> {
        RedisCacheBuilder::new()
    }

    fn get_connection(&self) -> CacheResult<redis::aio::MultiplexedConnection> {
        self.client
            .get_multiplexed_async_connection()
            .map_err(|e| CacheError::ConnectionError(e.to_string()))
    }

    fn serialize_key(key: &K) -> CacheResult<Vec<u8>> {
        bincode::serialize(key).map_err(|e| CacheError::SerializationError(e.to_string()))
    }

    fn serialize_value(value: &V) -> CacheResult<Vec<u8>> {
        bincode::serialize(value).map_err(|e| CacheError::SerializationError(e.to_string()))
    }

    fn deserialize_value(data: &[u8]) -> CacheResult<V> {
        bincode::deserialize(data).map_err(|e| CacheError::DeserializationError(e.to_string()))
    }
}

impl<K, V> CacheBackend for RedisCache<K, V>
where
    K: Send + Sync + Hash + Eq + std::fmt::Debug + Serialize + for<'de> Deserialize<'de> + 'static,
    V: Send + Sync + Clone + Serialize + for<'de> Deserialize<'de> + 'static,
{
    fn name(&self) -> &str {
        "redis"
    }

    fn is_persistent(&self) -> bool {
        true
    }

    fn metrics(&self) -> CacheMetrics {
        self.metrics.clone()
    }
}

#[async_trait]
impl<K, V> Cache<K, V> for RedisCache<K, V>
where
    K: Send + Sync + Hash + Eq + std::fmt::Debug + Serialize + for<'de> Deserialize<'de> + 'static,
    V: Send + Sync + Clone + Serialize + for<'de> Deserialize<'de> + 'static,
{
    async fn get(&self, key: &K) -> CacheResult<Option<V>> {
        let mut conn = self.get_connection().await?;
        let key_bytes = Self::serialize_key(key)?;

        let value_bytes: Option<Vec<u8>> = redis::cmd("GET")
            .arg(key_bytes.as_slice())
            .query_async(&mut conn)
            .await
            .map_err(|e| CacheError::DatabaseError(e.to_string()))?;

        if let Some(bytes) = value_bytes {
            let value = Self::deserialize_value(&bytes)?;
            self.metrics.record_hit();
            Ok(Some(value))
        } else {
            self.metrics.record_miss();
            Ok(None)
        }
    }

    async fn set(&self, key: K, value: V) -> CacheResult<()> {
        let mut conn = self.get_connection().await?;
        let key_bytes = Self::serialize_key(&key)?;
        let value_bytes = Self::serialize_value(&value)?;

        redis::cmd("SET")
            .arg(key_bytes.as_slice())
            .arg(value_bytes.as_slice())
            .query_async::<_, ()>(&mut conn)
            .await
            .map_err(|e| CacheError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    async fn invalidate(&self, key: &K) -> CacheResult<()> {
        let mut conn = self.get_connection().await?;
        let key_bytes = Self::serialize_key(key)?;

        redis::cmd("DEL")
            .arg(key_bytes.as_slice())
            .query_async::<_, ()>(&mut conn)
            .await
            .map_err(|e| CacheError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    async fn remove(&self, key: &K) -> CacheResult<()> {
        self.invalidate(key).await
    }

    async fn clear(&self) -> CacheResult<()> {
        let mut conn = self.get_connection().await?;

        redis::cmd("FLUSHDB")
            .query_async::<_, ()>(&mut conn)
            .await
            .map_err(|e| CacheError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    async fn contains(&self, key: &K) -> CacheResult<bool> {
        let mut conn = self.get_connection().await?;
        let key_bytes = Self::serialize_key(key)?;

        let exists: bool = redis::cmd("EXISTS")
            .arg(key_bytes.as_slice())
            .query_async(&mut conn)
            .await
            .map_err(|e| CacheError::DatabaseError(e.to_string()))?;

        Ok(exists)
    }

    async fn size(&self) -> CacheResult<usize> {
        let mut conn = self.get_connection().await?;

        let size: usize = redis::cmd("DBSIZE")
            .query_async(&mut conn)
            .await
            .map_err(|e| CacheError::DatabaseError(e.to_string()))?;

        Ok(size)
    }

    async fn is_empty(&self) -> CacheResult<bool> {
        Ok(self.size().await? == 0)
    }
}

pub struct RedisCacheBuilder<K, V> {
    url: Option<String>,
    _phantom: std::marker::PhantomData<(K, V)>,
}

impl<K, V> RedisCacheBuilder<K, V>
where
    K: Send + Sync + Hash + Eq + std::fmt::Debug + Serialize + for<'de> Deserialize<'de> + 'static,
    V: Send + Sync + Clone + Serialize + for<'de> Deserialize<'de> + 'static,
{
    pub fn new() -> Self {
        Self {
            url: None,
            _phantom: std::marker::PhantomData,
        }
    }

    pub fn url(mut self, url: String) -> Self {
        self.url = Some(url);
        self
    }

    pub fn build(self) -> CacheResult<RedisCache<K, V>> {
        let url = self
            .url
            .ok_or_else(|| CacheError::InvalidConfig("Redis cache requires URL".to_string()))?;

        let config = CacheConfig {
            backend: crate::config::CacheBackendType::Redis { url },
            max_capacity: 10000,
            ttl: None,
            ttl_idle: None,
            eviction_policy: crate::config::EvictionPolicy::Lru,
            enable_metrics: true,
            namespace: None,
        };

        RedisCache::new(&config)
    }
}

impl<K, V> Default for RedisCacheBuilder<K, V>
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

    #[tokio::test]
    #[ignore]
    async fn test_redis_cache_basic() {
        let cache = RedisCache::<String, String>::builder()
            .url("redis://127.0.0.1:6379".to_string())
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
    #[ignore]
    async fn test_redis_cache_remove() {
        let cache = RedisCache::<String, String>::builder()
            .url("redis://127.0.0.1:6379".to_string())
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
    #[ignore]
    async fn test_redis_cache_clear() {
        let cache = RedisCache::<String, String>::builder()
            .url("redis://127.0.0.1:6379".to_string())
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
}
