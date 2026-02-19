use crate::Result;
use async_trait::async_trait;
use cache::{Cache, CacheConfig, CacheKey, DiskCache};

#[async_trait]
pub trait CacheAdapter: Send + Sync {
    async fn get(&self, key: &str) -> Result<Option<Vec<u8>>>;
    async fn set(&self, key: &str, value: Vec<u8>, ttl_seconds: u64) -> Result<()>;
    async fn delete(&self, key: &str) -> Result<()>;
    async fn clear(&self) -> Result<()>;
    async fn contains(&self, key: &str) -> Result<bool>;
    async fn size(&self) -> Result<usize>;
}

pub struct RealCacheAdapter {
    cache: DiskCache<CacheKey, Vec<u8>>,
}

impl RealCacheAdapter {
    pub fn new(config: CacheConfig) -> Result<Self> {
        let cache = DiskCache::new(&config).map_err(|e| crate::error::AgentError::Memory(e))?;
        Ok(Self { cache })
    }

    pub fn in_memory() -> Result<Self> {
        let config = CacheConfig::in_memory();
        Self::new(config)
    }

    pub fn disk(path: String) -> Result<Self> {
        let config = CacheConfig::disk(path);
        Self::new(config)
    }
}

#[async_trait]
impl CacheAdapter for RealCacheAdapter {
    async fn get(&self, key: &str) -> Result<Option<Vec<u8>>> {
        let cache_key = CacheKey::new(key.to_string());
        self.cache
            .get(&cache_key)
            .await
            .map_err(|e| crate::error::AgentError::Memory(e))
    }

    async fn set(&self, key: &str, value: Vec<u8>, _ttl_seconds: u64) -> Result<()> {
        let cache_key = CacheKey::new(key.to_string());
        self.cache
            .set(cache_key, value)
            .await
            .map_err(|e| crate::error::AgentError::Memory(e))
    }

    async fn delete(&self, key: &str) -> Result<()> {
        let cache_key = CacheKey::new(key.to_string());
        self.cache
            .remove(&cache_key)
            .await
            .map_err(|e| crate::error::AgentError::Memory(e))
    }

    async fn clear(&self) -> Result<()> {
        self.cache
            .clear()
            .await
            .map_err(|e| crate::error::AgentError::Memory(e))
    }

    async fn contains(&self, key: &str) -> Result<bool> {
        let cache_key = CacheKey::new(key.to_string());
        self.cache
            .contains(&cache_key)
            .await
            .map_err(|e| crate::error::AgentError::Memory(e))
    }

    async fn size(&self) -> Result<usize> {
        self.cache
            .size()
            .await
            .map_err(|e| crate::error::AgentError::Memory(e))
    }
}
