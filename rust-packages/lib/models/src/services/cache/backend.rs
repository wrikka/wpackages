use crate::services::cache::CacheStats;
use crate::types::{ChatRequest, ChatResponse};
use async_trait::async_trait;
use std::future::Future;
use std::pin::Pin;

/// A trait for cache backends.
#[async_trait]
pub trait CacheBackend: Send + Sync {
    /// Get a chat response from the cache.
    fn get_chat<'a>(
        &'a self,
        key: &'a str,
    ) -> Pin<Box<dyn Future<Output = Option<ChatResponse>> + Send + 'a>>;

    /// Put a chat response into the cache.
    fn put_chat<'a>(
        &'a self,
        key: &'a str,
        response: &'a ChatResponse,
    ) -> Pin<Box<dyn Future<Output = ()> + Send + 'a>>;

    /// Clear the cache.
    fn clear<'a>(&'a self) -> Pin<Box<dyn Future<Output = ()> + Send + 'a>>;

    /// Get cache statistics.
    fn stats<'a>(&'a self) -> Pin<Box<dyn Future<Output = CacheStats> + Send + 'a>>;    
}
