//! Retry policy for HTTP requests

use std::time::Duration;

/// Retry policy configuration
#[derive(Debug, Clone)]
pub struct RetryPolicy {
    pub max_retries: u32,
    pub base_delay: Duration,
    pub max_delay: Duration,
    pub backoff_multiplier: f64,
    pub jitter: bool,
}

impl RetryPolicy {
    /// Create new retry policy
    pub fn new(max_retries: u32, base_delay: Duration) -> Self {
        Self {
            max_retries,
            base_delay,
            max_delay: Duration::from_secs(60),
            backoff_multiplier: 2.0,
            jitter: true,
        }
    }

    /// Set maximum delay
    pub fn with_max_delay(mut self, max_delay: Duration) -> Self {
        self.max_delay = max_delay;
        self
    }

    /// Set backoff multiplier
    pub fn with_backoff_multiplier(mut self, multiplier: f64) -> Self {
        self.backoff_multiplier = multiplier;
        self
    }

    /// Enable/disable jitter
    pub fn with_jitter(mut self, jitter: bool) -> Self {
        self.jitter = jitter;
        self
    }

    /// Calculate delay for given attempt
    pub fn calculate_delay(&self, attempt: u32) -> Duration {
        let delay_ms = self.base_delay.as_millis() as f64 
            * self.backoff_multiplier.powi(attempt as i32);

        let mut delay = Duration::from_millis(delay_ms as u64);

        // Apply maximum delay limit
        if delay > self.max_delay {
            delay = self.max_delay;
        }

        // Add jitter if enabled
        if self.jitter {
            let jitter_ms = (delay.as_millis() as f64 * 0.1) as u64;
            let random_jitter = fastrand::u64(0..=jitter_ms);
            delay = Duration::from_millis(delay.as_millis() as u64 + random_jitter);
        }

        delay
    }

    /// Check if error is retryable
    pub fn is_retryable_error(&self, error: &crate::error::EvalError) -> bool {
        match error {
            crate::error::EvalError::IoError(_) => true,
            crate::error::EvalError::ModelError(msg) => {
                msg.contains("timeout") 
                || msg.contains("connection") 
                || msg.contains("network")
                || msg.contains("rate limit")
            }
            _ => false,
        }
    }
}

impl Default for RetryPolicy {
    fn default() -> Self {
        Self::new(3, Duration::from_millis(1000))
            .with_max_delay(Duration::from_secs(30))
            .with_backoff_multiplier(2.0)
            .with_jitter(true)
    }
}

/// Exponential backoff with jitter strategy
#[derive(Debug, Clone)]
pub struct ExponentialBackoff {
    policy: RetryPolicy,
}

impl ExponentialBackoff {
    /// Create new exponential backoff
    pub fn new(max_retries: u32, base_delay: Duration) -> Self {
        Self {
            policy: RetryPolicy::new(max_retries, base_delay),
        }
    }

    /// Calculate delay with exponential backoff
    pub fn next_delay(&self, attempt: u32) -> Duration {
        self.policy.calculate_delay(attempt)
    }

    /// Check if should retry
    pub fn should_retry(&self, attempt: u32, error: &crate::error::EvalError) -> bool {
        attempt < self.policy.max_retries && self.policy.is_retryable_error(error)
    }
}

/// Linear backoff strategy
#[derive(Debug, Clone)]
pub struct LinearBackoff {
    policy: RetryPolicy,
}

impl LinearBackoff {
    /// Create new linear backoff
    pub fn new(max_retries: u32, base_delay: Duration) -> Self {
        Self {
            policy: RetryPolicy::new(max_retries, base_delay).with_backoff_multiplier(1.0),
        }
    }

    /// Calculate delay with linear backoff
    pub fn next_delay(&self, attempt: u32) -> Duration {
        self.policy.calculate_delay(attempt)
    }

    /// Check if should retry
    pub fn should_retry(&self, attempt: u32, error: &crate::error::EvalError) -> bool {
        attempt < self.policy.max_retries && self.policy.is_retryable_error(error)
    }
}
