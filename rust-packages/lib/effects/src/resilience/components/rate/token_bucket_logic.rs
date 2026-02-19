use crate::resilience::types::RateLimitResult;
use std::time::{SystemTime, UNIX_EPOCH};

/// Pure token bucket logic without side effects
#[derive(Debug, Clone)]
pub struct TokenBucketState {
    pub tokens: f64,
    pub last_refill: u64,
    pub capacity: f64,
    pub refill_rate: f64,
}

impl TokenBucketState {
    pub fn new(capacity: f64, refill_rate: f64) -> Self {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        Self {
            tokens: capacity,
            last_refill: now,
            capacity,
            refill_rate,
        }
    }

    /// Refill tokens based on elapsed time (pure function)
    pub fn refill(&self, now: u64) -> Self {
        let elapsed = now.saturating_sub(self.last_refill) as f64;
        let tokens_to_add = elapsed * self.refill_rate;
        let new_tokens = (self.tokens + tokens_to_add).min(self.capacity);

        Self {
            tokens: new_tokens,
            last_refill: now,
            capacity: self.capacity,
            refill_rate: self.refill_rate,
        }
    }

    /// Check if request is allowed and consume token (pure function)
    pub fn check_and_consume(&self, tokens_needed: f64) -> (Self, bool) {
        let allowed = self.tokens >= tokens_needed;
        let new_tokens = if allowed {
            self.tokens - tokens_needed
        } else {
            self.tokens
        };

        (
            Self {
                tokens: new_tokens,
                last_refill: self.last_refill,
                capacity: self.capacity,
                refill_rate: self.refill_rate,
            },
            allowed,
        )
    }

    /// Create rate limit result (pure function)
    pub fn to_result(
        &self,
        allowed: bool,
        max_requests: u32,
        window_seconds: u64,
    ) -> RateLimitResult {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        RateLimitResult {
            allowed,
            remaining: self.tokens as u32,
            reset_at: Some(now + window_seconds),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_token_bucket_refill() {
        let state = TokenBucketState::new(10.0, 1.0);
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let state = state.refill(now + 5);
        assert_eq!(state.tokens, 10.0); // No refill yet

        let state = state.refill(now + 10);
        assert_eq!(state.tokens, 10.0); // Max capacity
    }

    #[test]
    fn test_token_bucket_consume() {
        let state = TokenBucketState::new(10.0, 1.0);
        let (state, allowed) = state.check_and_consume(1.0);
        assert!(allowed);
        assert_eq!(state.tokens, 9.0);

        let (state, allowed) = state.check_and_consume(10.0);
        assert!(!allowed);
        assert_eq!(state.tokens, 9.0);
    }
}
