use crate::error::{VectorSearchError, VectorSearchResult};
use crate::types::{SearchQuery, SearchResult};
use cache::prelude::*;
use cache::Cache;
use cache::CacheBackend;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Hash, Eq, PartialEq)]
pub struct SearchCacheKey {
    pub query_hash: String,
    pub top_k: usize,
    pub metric: String,
}

impl SearchCacheKey {
    pub fn from_query(query: &SearchQuery) -> Self {
        let query_bytes = serde_json::to_vec(query).unwrap_or_default();
        let query_hash = blake3::hash(&query_bytes).to_hex().to_string();

        Self {
            query_hash,
            top_k: query.top_k,
            metric: format!("{:?}", query.metric.unwrap_or_default()),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CachedSearchResults {
    pub results: Vec<SearchResult>,
    pub timestamp: u64,
}

impl CachedSearchResults {
    pub fn new(results: Vec<SearchResult>) -> Self {
        Self {
            results,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        }
    }
}

pub struct SearchCache {
    cache: cache::InMemoryCache<SearchCacheKey, CachedSearchResults>,
}

impl SearchCache {
    pub fn new(max_capacity: usize, ttl_secs: u64) -> Self {
        let config = CacheConfig::builder()
            .backend(cache::config::CacheBackendType::InMemory)
            .max_capacity(max_capacity)
            .ttl(std::time::Duration::from_secs(ttl_secs))
            .enable_metrics(true)
            .build();

        Self {
            cache: cache::InMemoryCache::new(&config),
        }
    }

    pub async fn get(&self, key: &SearchCacheKey) -> VectorSearchResult<Option<Vec<SearchResult>>> {
        match self.cache.get(key).await {
            Ok(Some(cached)) => Ok(Some(cached.results)),
            Ok(None) => Ok(None),
            Err(e) => Err(VectorSearchError::Cache(e.to_string())),
        }
    }

    pub async fn set(
        &self,
        key: SearchCacheKey,
        results: Vec<SearchResult>,
    ) -> VectorSearchResult<()> {
        self.cache
            .set(key, CachedSearchResults::new(results))
            .await
            .map_err(|e| VectorSearchError::Cache(e.to_string()))
    }

    pub async fn invalidate(&self, key: &SearchCacheKey) -> VectorSearchResult<()> {
        self.cache
            .remove(key)
            .await
            .map_err(|e| VectorSearchError::Cache(e.to_string()))
    }

    pub async fn clear(&self) -> VectorSearchResult<()> {
        self.cache
            .clear()
            .await
            .map_err(|e| VectorSearchError::Cache(e.to_string()))
    }

    pub fn metrics(&self) -> CacheMetrics {
        self.cache.metrics()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_search_cache_key() {
        let query = SearchQuery::new(vec![1.0, 0.0, 0.0], 5);
        let key = SearchCacheKey::from_query(&query);

        assert_eq!(key.top_k, 5);
        assert!(!key.query_hash.is_empty());
    }

    #[tokio::test]
    async fn test_search_cache_basic() {
        let cache = SearchCache::new(100, 3600);
        let query = SearchQuery::new(vec![1.0, 0.0, 0.0], 5);
        let key = SearchCacheKey::from_query(&query);

        let results = vec![SearchResult {
            index: 0,
            score: 0.95,
            metadata: serde_json::Value::Null,
        }];

        cache.set(key.clone(), results.clone()).await.unwrap();
        let cached = cache.get(&key).await.unwrap();

        assert!(cached.is_some());
        assert_eq!(cached.unwrap().len(), 1);
    }

    #[tokio::test]
    async fn test_search_cache_miss() {
        let cache = SearchCache::new(100, 3600);
        let query = SearchQuery::new(vec![1.0, 0.0, 0.0], 5);
        let key = SearchCacheKey::from_query(&query);

        let cached = cache.get(&key).await.unwrap();
        assert!(cached.is_none());
    }

    #[tokio::test]
    async fn test_search_cache_metrics() {
        let cache = SearchCache::new(100, 3600);
        let query = SearchQuery::new(vec![1.0, 0.0, 0.0], 5);
        let key = SearchCacheKey::from_query(&query);

        let results = vec![SearchResult {
            index: 0,
            score: 0.95,
            metadata: serde_json::Value::Null,
        }];

        cache.set(key.clone(), results).await.unwrap();
        cache.get(&key).await.unwrap();
        cache
            .get(&SearchCacheKey::from_query(&SearchQuery::new(
                vec![0.0, 1.0, 0.0],
                5,
            )))
            .await
            .unwrap();

        let metrics = cache.metrics();
        assert_eq!(metrics.hits(), 1);
        assert_eq!(metrics.misses(), 1);
    }
}
