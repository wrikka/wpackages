use super::backend::CacheBackend;
use crate::types::{ChatRequest, ChatResponse};
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, SystemTime};
use tokio::sync::RwLock;

#[derive(Debug, Clone)]
struct CacheEntry<T> {
    value: T,
    created_at: SystemTime,
    ttl: Duration,
}

impl<T> CacheEntry<T> {
    fn new(value: T, ttl: Duration) -> Self {
        Self {
            value,
            created_at: SystemTime::now(),
            ttl,
        }
    }

    fn is_expired(&self) -> bool {
        self.created_at.elapsed().unwrap_or(Duration::from_secs(0)) > self.ttl
    }
}

pub struct InMemoryCache {
    chat_cache: Arc<RwLock<HashMap<String, CacheEntry<ChatResponse>>>>,
    ttl: Duration,
}

impl InMemoryCache {
    pub fn new(ttl_seconds: u64) -> Self {
        Self {
            chat_cache: Arc::new(RwLock::new(HashMap::new())),
            ttl: Duration::from_secs(ttl_seconds),
        }
    }
}

#[async_trait]
impl CacheBackend for InMemoryCache {
    async fn get_chat(&self, key: &str) -> Option<ChatResponse> {
        let cache = self.chat_cache.read().await;
        cache
            .get(key)
            .filter(|entry| !entry.is_expired())
            .map(|entry| entry.value.clone())
    }

    async fn put_chat(&self, key: &str, response: &ChatResponse) {
        let mut cache = self.chat_cache.write().await;
        cache.insert(key.to_string(), CacheEntry::new(response.clone(), self.ttl));
    }

    async fn clear(&self) {
        self.chat_cache.write().await.clear();
    }

    async fn stats(&self) -> super::CacheStats {
        super::CacheStats {
            chat_entries: self.chat_cache.read().await.len() as u64,
        }
    }
}
