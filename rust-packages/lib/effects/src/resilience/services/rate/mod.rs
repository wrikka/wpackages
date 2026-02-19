mod in_memory;
mod token_bucket_storage;

#[async_trait::async_trait]
pub trait RateLimiter: Send + Sync {
    async fn check(&self, key: String) -> crate::resilience::error::Result<crate::resilience::types::RateLimitResult>;
    async fn reset(&self, key: String) -> crate::resilience::error::Result<()>;
}

pub trait Storage: Send + Sync {
    fn get_tokens(&self, key: &str) -> Option<u32>;
    fn set_tokens(&self, key: &str, tokens: u32);
    fn get_last_refill(&self, key: &str) -> Option<u64>;
    fn set_last_refill(&self, key: &str, timestamp: u64);
}

pub use in_memory::InMemoryStorage;
pub use token_bucket_storage::TokenBucketStorage;
