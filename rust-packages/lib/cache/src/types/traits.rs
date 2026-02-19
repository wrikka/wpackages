use async_trait::async_trait;
use serde::{Deserialize, Serialize};

use crate::error::CacheResult;
use crate::utils::CacheMetrics;

#[async_trait]
pub trait Cache<K, V>: Send + Sync
where
    K: Send + Sync + std::hash::Hash + Eq + std::fmt::Debug + Clone + 'static,
    V: Send + Sync + Clone + Serialize + for<'de> Deserialize<'de> + 'static,
{
    async fn get(&self, key: &K) -> CacheResult<Option<V>>;

    async fn set(&self, key: K, value: V) -> CacheResult<()>;

    async fn invalidate(&self, key: &K) -> CacheResult<()>;

    async fn contains(&self, key: &K) -> CacheResult<bool>;

    async fn size(&self) -> CacheResult<usize>;

    async fn is_empty(&self) -> CacheResult<bool>;

    async fn remove(&self, key: &K) -> CacheResult<()>;

    async fn clear(&self) -> CacheResult<()>;
}

pub trait CacheBackend: Send + Sync {
    fn name(&self) -> &str;

    fn is_persistent(&self) -> bool;

    fn metrics(&self) -> CacheMetrics;
}
