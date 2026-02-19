//! Rate limiting middleware for task execution

use crate::types::Task;
use crate::error::Result;
use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;
use tracing::{warn, info};

/// Rate limiter using token bucket algorithm
pub struct RateLimiter {
    buckets: Arc<RwLock<HashMap<String, TokenBucket>>>,
    default_capacity: u32,
    default_refill_rate: u32,
}

/// Token bucket for rate limiting
#[derive(Debug, Clone)]
struct TokenBucket {
    capacity: u32,
    tokens: u32,
    refill_rate: u32, // tokens per second
    last_refill: Instant,
}

impl TokenBucket {
    fn new(capacity: u32, refill_rate: u32) -> Self {
        Self {
            capacity,
            tokens: capacity,
            refill_rate,
            last_refill: Instant::now(),
        }
    }

    fn try_consume(&mut self, tokens: u32) -> bool {
        self.refill();

        if self.tokens >= tokens {
            self.tokens -= tokens;
            true
        } else {
            false
        }
    }

    fn refill(&mut self) {
        let elapsed = self.last_refill.elapsed();
        let tokens_to_add = (elapsed.as_secs_f64() * self.refill_rate as f64) as u32;

        if tokens_to_add > 0 {
            self.tokens = (self.tokens + tokens_to_add).min(self.capacity);
            self.last_refill = Instant::now();
        }
    }

    fn available_tokens(&self) -> u32 {
        let mut bucket = self.clone();
        bucket.refill();
        bucket.tokens
    }
}

impl RateLimiter {
    /// Create a new rate limiter
    pub fn new(default_capacity: u32, default_refill_rate: u32) -> Self {
        Self {
            buckets: Arc::new(RwLock::new(HashMap::new())),
            default_capacity,
            default_refill_rate,
        }
    }

    /// Create a rate limiter with default settings (10 requests per second)
    pub fn with_defaults() -> Self {
        Self::new(10, 10)
    }

    /// Register a new rate limit bucket
    pub async fn register(&self, key: String, capacity: u32, refill_rate: u32) {
        let mut buckets = self.buckets.write().await;
        buckets.insert(key, TokenBucket::new(capacity, refill_rate));
    }

    /// Check if a request is allowed
    pub async fn try_acquire(&self, key: &str, tokens: u32) -> bool {
        let mut buckets = self.buckets.write().await;

        let bucket = buckets.entry(key.to_string())
            .or_insert_with(|| TokenBucket::new(self.default_capacity, self.default_refill_rate));

        bucket.try_consume(tokens)
    }

    /// Get available tokens for a key
    pub async fn available_tokens(&self, key: &str) -> u32 {
        let buckets = self.buckets.read().await;
        buckets.get(key)
            .map(|b| b.available_tokens())
            .unwrap_or(self.default_capacity)
    }

    /// Reset a rate limit bucket
    pub async fn reset(&self, key: &str) {
        let mut buckets = self.buckets.write().await;
        if let Some(bucket) = buckets.get_mut(key) {
            bucket.tokens = bucket.capacity;
            bucket.last_refill = Instant::now();
        }
    }

    /// Remove a rate limit bucket
    pub async fn remove(&self, key: &str) {
        let mut buckets = self.buckets.write().await;
        buckets.remove(key);
    }

    /// Get statistics for all buckets
    pub async fn stats(&self) -> HashMap<String, RateLimitStats> {
        let buckets = self.buckets.read().await;
        let mut stats = HashMap::new();

        for (key, bucket) in buckets.iter() {
            stats.insert(key.clone(), RateLimitStats {
                capacity: bucket.capacity,
                available: bucket.available_tokens(),
                refill_rate: bucket.refill_rate,
            });
        }

        stats
    }
}

/// Rate limit statistics
#[derive(Debug, Clone)]
pub struct RateLimitStats {
    pub capacity: u32,
    pub available: u32,
    pub refill_rate: u32,
}

/// Rate limiting middleware
pub struct RateLimitingMiddleware {
    limiter: RateLimiter,
    key_extractor: Box<dyn Fn(&Task) -> String + Send + Sync>,
}

impl RateLimitingMiddleware {
    /// Create a new rate limiting middleware
    pub fn new(limiter: RateLimiter) -> Self {
        Self {
            limiter,
            key_extractor: Box::new(|task| task.name.clone()),
        }
    }

    /// Create a new rate limiting middleware with custom key extractor
    pub fn with_key_extractor<F>(limiter: RateLimiter, key_extractor: F) -> Self
    where
        F: Fn(&Task) -> String + Send + Sync + 'static,
    {
        Self {
            limiter,
            key_extractor: Box::new(key_extractor),
        }
    }

    /// Create a rate limiting middleware with default settings
    pub fn with_defaults() -> Self {
        Self::new(RateLimiter::with_defaults())
    }
}

impl crate::middleware::Middleware for RateLimitingMiddleware {
    fn before(&self, task: &mut Task) -> Result<()> {
        let key = (self.key_extractor)(task);

        // Use blocking call since this is synchronous
        let limiter = self.limiter.clone();
        let allowed = tokio::runtime::Handle::try_current()
            .ok_or_else(|| crate::error::TaskError::Other("No tokio runtime".to_string()))?
            .block_on(async { limiter.try_acquire(&key, 1).await });

        if !allowed {
            warn!("Rate limit exceeded for task: {}", task.name);
            return Err(crate::error::TaskError::Other(format!(
                "Rate limit exceeded for task: {}", task.name
            )));
        }

        info!("Rate limit check passed for task: {}", task.name);
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_rate_limiter_basic() {
        let limiter = RateLimiter::new(5, 10); // 5 capacity, 10 tokens/sec

        // Should allow 5 requests immediately
        for _ in 0..5 {
            assert!(limiter.try_acquire("test", 1).await);
        }

        // 6th request should be denied
        assert!(!limiter.try_acquire("test", 1).await);

        // Wait for refill
        tokio::time::sleep(Duration::from_millis(200)).await;

        // Should allow more requests after refill
        assert!(limiter.try_acquire("test", 1).await);
    }

    #[tokio::test]
    async fn test_rate_limiter_multiple_keys() {
        let limiter = RateLimiter::new(2, 2);

        // Each key has its own bucket
        assert!(limiter.try_acquire("key1", 1).await);
        assert!(limiter.try_acquire("key1", 1).await);
        assert!(!limiter.try_acquire("key1", 1).await);

        // key2 should have its own capacity
        assert!(limiter.try_acquire("key2", 1).await);
        assert!(limiter.try_acquire("key2", 1).await);
    }

    #[tokio::test]
    async fn test_rate_limiter_reset() {
        let limiter = RateLimiter::new(2, 2);

        // Consume all tokens
        assert!(limiter.try_acquire("test", 1).await);
        assert!(limiter.try_acquire("test", 1).await);
        assert!(!limiter.try_acquire("test", 1).await);

        // Reset
        limiter.reset("test").await;

        // Should allow requests again
        assert!(limiter.try_acquire("test", 1).await);
    }

    #[tokio::test]
    async fn test_rate_limiter_available_tokens() {
        let limiter = RateLimiter::new(10, 5);

        assert_eq!(limiter.available_tokens("test").await, 10);

        limiter.try_acquire("test", 3).await;
        assert_eq!(limiter.available_tokens("test").await, 7);
    }

    #[tokio::test]
    async fn test_rate_limiter_stats() {
        let limiter = RateLimiter::new(10, 5);

        limiter.register("key1".to_string(), 5, 2).await;
        limiter.register("key2".to_string(), 20, 10).await;

        let stats = limiter.stats().await;
        assert_eq!(stats.len(), 2);
        assert_eq!(stats.get("key1").unwrap().capacity, 5);
        assert_eq!(stats.get("key2").unwrap().capacity, 20);
    }

    #[tokio::test]
    async fn test_rate_limiting_middleware() {
        let limiter = RateLimiter::new(2, 2);
        let middleware = RateLimitingMiddleware::new(limiter);

        let mut task1 = Task::new("test-task");
        let mut task2 = Task::new("test-task");
        let mut task3 = Task::new("test-task");

        // First two should pass
        assert!(middleware.before(&mut task1).is_ok());
        assert!(middleware.before(&mut task2).is_ok());

        // Third should be rate limited
        assert!(middleware.before(&mut task3).is_err());
    }

    #[tokio::test]
    async fn test_rate_limiting_middleware_custom_key() {
        let limiter = RateLimiter::new(2, 2);
        let middleware = RateLimitingMiddleware::with_key_extractor(
            limiter,
            |task| task.id.clone(),
        );

        let mut task1 = Task::new("task1");
        let mut task2 = Task::new("task2");
        let mut task3 = Task::new("task3");

        // Each task has its own key (id), so all should pass
        assert!(middleware.before(&mut task1).is_ok());
        assert!(middleware.before(&mut task2).is_ok());
        assert!(middleware.before(&mut task3).is_ok());
    }
}
