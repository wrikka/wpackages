use crate::resilience::error::Result;
use crate::resilience::services::circuit::RetryPolicy;
use async_trait::async_trait;

pub struct ExponentialBackoffRetry {
    max_attempts: u32,
    base_backoff_ms: u64,
}

impl ExponentialBackoffRetry {
    pub fn new(max_attempts: u32, base_backoff_ms: u64) -> Self {
        Self {
            max_attempts,
            base_backoff_ms,
        }
    }
}

impl RetryPolicy for ExponentialBackoffRetry {
    fn should_retry(&self, attempt: u32) -> bool {
        attempt < self.max_attempts
    }

    fn backoff_ms(&self, attempt: u32) -> u64 {
        self.base_backoff_ms * 2_u64.pow(attempt.saturating_sub(1))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_should_retry() {
        let policy = ExponentialBackoffRetry::new(3, 1000);

        assert!(policy.should_retry(0));
        assert!(policy.should_retry(1));
        assert!(policy.should_retry(2));
        assert!(!policy.should_retry(3));
    }

    #[test]
    fn test_backoff_delay() {
        let policy = ExponentialBackoffRetry::new(3, 1000);

        assert_eq!(policy.backoff_ms(1), 1000);
        assert_eq!(policy.backoff_ms(2), 2000);
        assert_eq!(policy.backoff_ms(3), 4000);
    }
}
