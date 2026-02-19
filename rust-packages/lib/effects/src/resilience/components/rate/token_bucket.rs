use crate::resilience::components::rate::token_bucket_logic::TokenBucketState;
use crate::resilience::config::RateConfig;
use crate::resilience::error::Result;
use crate::resilience::services::rate::{RateLimiter, TokenBucketStorage};
use crate::resilience::types::{RateLimitResult, RequestKey};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

pub struct TokenBucketLimiter {
    config: RateConfig,
    storage: Arc<dyn TokenBucketStorage>,
}

impl TokenBucketLimiter {
    pub fn new(config: RateConfig, storage: Arc<dyn TokenBucketStorage>) -> Self {
        Self { config, storage }
    }
}

#[async_trait::async_trait]
impl RateLimiter for TokenBucketLimiter {
    async fn check(&self, key: String) -> crate::resilience::error::Result<crate::resilience::types::RateLimitResult> {
        let storage_key = key;
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let capacity = self.config.max_requests as f64;
        let refill_rate = 1.0;

        let mut state = if let Some(state_data) = self.storage.get_state(&storage_key).await? {
            state_data.into()
        } else {
            TokenBucketState::new(capacity, refill_rate)
        };

        state = state.refill(now);
        let (new_state, allowed) = state.check_and_consume(1.0);

        let state_clone = new_state.clone();
        self.storage
            .set_state(&storage_key, &state_clone.into())
            .await?;

        Ok(new_state.to_result(
            allowed,
            self.config.max_requests,
            self.config.window_seconds,
        ))
    }

    async fn reset(&self, key: String) -> crate::resilience::error::Result<()> {
        let storage_key = key;
        self.storage.delete(&storage_key).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::resilience::services::rate::InMemoryStorage;

    #[tokio::test]
    async fn test_token_bucket_check() {
        let config = RateConfig {
            max_requests: 5,
            window_seconds: 60,
        };
        let storage = Arc::new(InMemoryStorage::new());
        let limiter = TokenBucketLimiter::new(config, storage);

        let key = RequestKey::new("user_123", "/api/test");

        for i in 0..5 {
            let result = limiter.check(&key).await.unwrap();
            assert!(result.allowed, "Request {} should be allowed", i + 1);
        }

        let result = limiter.check(&key).await.unwrap();
        assert!(!result.allowed, "6th request should be blocked");
    }

    #[tokio::test]
    async fn test_token_bucket_reset() {
        let config = RateConfig {
            max_requests: 5,
            window_seconds: 60,
        };
        let storage = Arc::new(InMemoryStorage::new());
        let limiter = TokenBucketLimiter::new(config, storage);

        let key = RequestKey::new("user_123", "/api/test");

        for _ in 0..5 {
            limiter.check(&key).await.unwrap();
        }

        limiter.reset(&key).await.unwrap();

        let result = limiter.check(&key).await.unwrap();
        assert!(result.allowed, "Request after reset should be allowed");
    }
}
