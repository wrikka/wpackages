use crate::error::RagResult;
use crate::types::{RagQuery, RagResponse};
use cache::prelude::*;
use cache::CacheBackend;
use serde::{Deserialize, Serialize};
use std::hash::Hash;

#[derive(Debug, Clone, Serialize, Deserialize, Hash, Eq, PartialEq)]
pub struct RAGCacheKey {
    pub query_hash: String,
    pub top_k: usize,
}

impl RAGCacheKey {
    pub fn from_query(query: &RagQuery) -> Self {
        let query_bytes = serde_json::to_vec(query).unwrap_or_default();
        let query_hash = blake3::hash(&query_bytes).to_hex().to_string();

        Self {
            query_hash,
            top_k: query.options.top_k.unwrap_or_default(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CachedRAGResponse {
    pub response: RagResponse,
    pub timestamp: u64,
}

impl CachedRAGResponse {
    pub fn new(response: RagResponse) -> Self {
        Self {
            response,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        }
    }
}

pub struct RAGCache {
    cache: cache::InMemoryCache<RAGCacheKey, CachedRAGResponse>,
}

impl RAGCache {
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

    pub async fn get(&self, key: &RAGCacheKey) -> RagResult<Option<RagResponse>> {
        match self.cache.get(key).await? {
            Some(cached) => Ok(Some(cached.response)),
            None => Ok(None),
        }
    }

    pub async fn set(&self, key: RAGCacheKey, response: RagResponse) -> RagResult<()> {
        self.cache
            .set(key, CachedRAGResponse::new(response))
            .await?;
        Ok(())
    }

    pub async fn invalidate(&self, key: &RAGCacheKey) -> RagResult<()> {
        self.cache.remove(key).await?;
        Ok(())
    }

    pub async fn clear(&self) -> RagResult<()> {
        self.cache.clear().await?;
        Ok(())
    }

    pub fn metrics(&self) -> CacheMetrics {
        self.cache.metrics()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_rag_cache_key() {
        let query = RagQuery {
            query: "What is AI?".to_string(),
            documents: vec![],
            options: crate::types::RagOptions {
                top_k: Some(5),
                min_similarity: None,
                include_metadata: false,
                ..Default::default()
            },
        };
        let key = RAGCacheKey::from_query(&query);

        assert_eq!(key.top_k, 5);
        assert!(!key.query_hash.is_empty());
    }

    #[tokio::test]
    async fn test_rag_cache_basic() {
        let cache: RAGCache = RAGCache::new(100, 3600);
        let query = RagQuery {
            query: "What is AI?".to_string(),
            documents: vec![],
            options: crate::types::RagOptions {
                top_k: Some(5),
                min_similarity: None,
                include_metadata: false,
                ..Default::default()
            },
        };
        let key = RAGCacheKey::from_query(&query);

        let response = RagResponse {
            answer: "AI is artificial intelligence".to_string(),
            context: vec![],
            sources: vec![],
            model: "test-model".to_string(),
        };

        cache.set(key.clone(), response.clone()).await.unwrap();
        let cached = cache.get(&key).await.unwrap();

        assert!(cached.is_some());
        assert_eq!(cached.unwrap().answer, "AI is artificial intelligence");
    }

    #[tokio::test]
    async fn test_rag_cache_miss() {
        let cache: RAGCache = RAGCache::new(100, 3600);
        let query = RagQuery {
            query: "What is AI?".to_string(),
            documents: vec![],
            options: crate::types::RagOptions {
                top_k: Some(5),
                min_similarity: None,
                include_metadata: false,
                ..Default::default()
            },
        };
        let key = RAGCacheKey::from_query(&query);

        let cached = cache.get(&key).await.unwrap();
        assert!(cached.is_none());
    }

    #[tokio::test]
    async fn test_rag_cache_metrics() {
        let cache: RAGCache = RAGCache::new(100, 3600);
        let query = RagQuery {
            query: "What is AI?".to_string(),
            documents: vec![],
            options: crate::types::RagOptions {
                top_k: Some(5),
                min_similarity: None,
                include_metadata: false,
                ..Default::default()
            },
        };
        let key = RAGCacheKey::from_query(&query);

        let response = RagResponse {
            answer: "AI is artificial intelligence".to_string(),
            context: vec![],
            sources: vec![],
            model: "test-model".to_string(),
        };

        cache.set(key.clone(), response).await.unwrap();
        cache.get(&key).await.unwrap();

        let other_query = RagQuery {
            query: "Other question".to_string(),
            documents: vec![],
            options: crate::types::RagOptions {
                top_k: Some(5),
                min_similarity: None,
                include_metadata: false,
                ..Default::default()
            },
        };
        cache
            .get(&RAGCacheKey::from_query(&other_query))
            .await
            .unwrap();

        let metrics = cache.metrics();
        assert_eq!(metrics.hits(), 1);
        assert_eq!(metrics.misses(), 1);
    }
}
