use crate::error::{CompletionError, CompletionResult};
use async_trait::async_trait;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::Mutex;

#[async_trait]
pub trait RateLimiter: Send + Sync {
    async fn check_rate_limit(&self, key: &str) -> CompletionResult<RateLimitResult>;
    async fn record_request(&self, key: &str);
    async fn reset(&self, key: &str);
    async fn get_remaining(&self, key: &str) -> CompletionResult<usize>;
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct RateLimitResult {
    pub allowed: bool,
    pub remaining: usize,
    pub reset_at: Option<Instant>,
}

pub struct TokenBucketRateLimiter {
    buckets: Arc<Mutex<std::collections::HashMap<String, TokenBucket>>>,
    capacity: usize,
    refill_rate: Duration,
}

impl TokenBucketRateLimiter {
    pub fn new(capacity: usize, refill_rate: Duration) -> Self {
        Self {
            buckets: Arc::new(Mutex::new(std::collections::HashMap::new())),
            capacity,
            refill_rate,
        }
    }

    pub fn builder() -> TokenBucketRateLimiterBuilder {
        TokenBucketRateLimiterBuilder::new()
    }
}

pub struct TokenBucketRateLimiterBuilder {
    capacity: usize,
    refill_rate: Duration,
}

impl TokenBucketRateLimiterBuilder {
    pub fn new() -> Self {
        Self {
            capacity: 100,
            refill_rate: Duration::from_secs(60),
        }
    }

    pub fn with_capacity(mut self, capacity: usize) -> Self {
        self.capacity = capacity;
        self
    }

    pub fn with_refill_rate(mut self, rate: Duration) -> Self {
        self.refill_rate = rate;
        self
    }

    pub fn build(self) -> TokenBucketRateLimiter {
        TokenBucketRateLimiter::new(self.capacity, self.refill_rate)
    }
}

#[derive(Debug, Clone)]
struct TokenBucket {
    tokens: f64,
    last_refill: Instant,
    capacity: usize,
}

impl TokenBucket {
    fn new(capacity: usize) -> Self {
        Self {
            tokens: capacity as f64,
            last_refill: Instant::now(),
            capacity,
        }
    }

    fn refill(&mut self, refill_rate: Duration) {
        let now = Instant::now();
        let elapsed = now.duration_since(self.last_refill);
        let elapsed_secs = elapsed.as_secs_f64();
        let refill_rate_secs = refill_rate.as_secs_f64();

        if elapsed_secs > 0.0 {
            let tokens_to_add = (elapsed_secs / refill_rate_secs) * self.capacity as f64;
            self.tokens = (self.tokens + tokens_to_add).min(self.capacity as f64);
            self.last_refill = now;
        }
    }

    fn try_consume(&mut self, tokens: usize) -> bool {
        if self.tokens >= tokens as f64 {
            self.tokens -= tokens as f64;
            true
        } else {
            false
        }
    }

    fn remaining(&self) -> usize {
        self.tokens as usize
    }

    fn reset_at(&self, refill_rate: Duration) -> Instant {
        let tokens_needed = self.capacity as f64 - self.tokens;
        let time_needed = Duration::from_secs_f64(
            tokens_needed * refill_rate.as_secs_f64() / self.capacity as f64,
        );
        self.last_refill + time_needed
    }
}

#[async_trait]
impl RateLimiter for TokenBucketRateLimiter {
    async fn check_rate_limit(&self, key: &str) -> CompletionResult<RateLimitResult> {
        let mut buckets = self.buckets.lock().await;
        let bucket = buckets
            .entry(key.to_string())
            .or_insert_with(|| TokenBucket::new(self.capacity));

        bucket.refill(self.refill_rate);

        let allowed = bucket.try_consume(1);
        let remaining = bucket.remaining();
        let reset_at = if !allowed {
            Some(bucket.reset_at(self.refill_rate))
        } else {
            None
        };

        Ok(RateLimitResult {
            allowed,
            remaining,
            reset_at,
        })
    }

    async fn record_request(&self, key: &str) {
        let mut buckets = self.buckets.lock().await;
        let bucket = buckets
            .entry(key.to_string())
            .or_insert_with(|| TokenBucket::new(self.capacity));
        bucket.refill(self.refill_rate);
        bucket.try_consume(1);
    }

    async fn reset(&self, key: &str) {
        let mut buckets = self.buckets.lock().await;
        buckets.remove(key);
    }

    async fn get_remaining(&self, key: &str) -> CompletionResult<usize> {
        let mut buckets = self.buckets.lock().await;
        let bucket = buckets
            .entry(key.to_string())
            .or_insert_with(|| TokenBucket::new(self.capacity));
        bucket.refill(self.refill_rate);
        Ok(bucket.remaining())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_token_bucket_rate_limiter() {
        let limiter = TokenBucketRateLimiter::builder()
            .with_capacity(5)
            .with_refill_rate(Duration::from_secs(1))
            .build();

        for i in 0..5 {
            let result = limiter.check_rate_limit("test").await.unwrap();
            assert!(result.allowed, "Request {} should be allowed", i);
        }

        let result = limiter.check_rate_limit("test").await.unwrap();
        assert!(!result.allowed, "6th request should be rate limited");
        assert_eq!(result.remaining, 0);
    }

    #[tokio::test]
    async fn test_token_bucket_refill() {
        let limiter = TokenBucketRateLimiter::builder()
            .with_capacity(2)
            .with_refill_rate(Duration::from_millis(100))
            .build();

        for _ in 0..2 {
            let result = limiter.check_rate_limit("test").await.unwrap();
            assert!(result.allowed);
        }

        let result = limiter.check_rate_limit("test").await.unwrap();
        assert!(!result.allowed);

        tokio::time::sleep(Duration::from_millis(150)).await;

        let result = limiter.check_rate_limit("test").await.unwrap();
        assert!(result.allowed, "Should be allowed after refill");
    }

    #[tokio::test]
    async fn test_rate_limiter_reset() {
        let limiter = TokenBucketRateLimiter::builder()
            .with_capacity(2)
            .with_refill_rate(Duration::from_secs(1))
            .build();

        for _ in 0..2 {
            limiter.check_rate_limit("test").await.unwrap();
        }

        limiter.reset("test").await;

        let result = limiter.check_rate_limit("test").await.unwrap();
        assert!(result.allowed, "Should be allowed after reset");
    }

    #[tokio::test]
    async fn test_rate_limiter_get_remaining() {
        let limiter = TokenBucketRateLimiter::builder()
            .with_capacity(5)
            .with_refill_rate(Duration::from_secs(1))
            .build();

        let remaining = limiter.get_remaining("test").await.unwrap();
        assert_eq!(remaining, 5);

        limiter.check_rate_limit("test").await.unwrap();
        let remaining = limiter.get_remaining("test").await.unwrap();
        assert_eq!(remaining, 4);
    }

    #[tokio::test]
    async fn test_rate_limiter_separate_keys() {
        let limiter = TokenBucketRateLimiter::builder()
            .with_capacity(2)
            .with_refill_rate(Duration::from_secs(1))
            .build();

        for _ in 0..2 {
            let result = limiter.check_rate_limit("user1").await.unwrap();
            assert!(result.allowed);
        }

        let result = limiter.check_rate_limit("user1").await.unwrap();
        assert!(!result.allowed);

        let result = limiter.check_rate_limit("user2").await.unwrap();
        assert!(result.allowed, "Different key should have separate bucket");
    }
}
