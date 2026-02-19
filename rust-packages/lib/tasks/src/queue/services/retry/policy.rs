//! Retry policy for failed tasks

use chrono::{DateTime, Duration, Utc};
use rand::Rng;

/// Retry backoff strategy
#[derive(Debug, Clone, Copy)]
pub enum RetryBackoff {
    /// Fixed delay between retries
    Fixed(Duration),
    /// Linear increase in delay
    Linear {
        initial: Duration,
        increment: Duration,
    },
    /// Exponential increase in delay
    Exponential { initial: Duration, multiplier: f64 },
    /// Exponential with jitter (recommended for distributed systems)
    ExponentialWithJitter {
        initial: Duration,
        multiplier: f64,
        jitter_factor: f64,
    },
}

impl Default for RetryBackoff {
    fn default() -> Self {
        Self::ExponentialWithJitter {
            initial: Duration::seconds(1),
            multiplier: 2.0,
            jitter_factor: 0.1,
        }
    }
}

/// Retry policy configuration
#[derive(Debug, Clone)]
pub struct RetryPolicy {
    /// Maximum number of retry attempts
    pub max_retries: usize,
    /// Backoff strategy for retries
    pub backoff: RetryBackoff,
    /// Maximum delay between retries
    pub max_delay: Option<Duration>,
}

impl Default for RetryPolicy {
    fn default() -> Self {
        Self {
            max_retries: 3,
            backoff: RetryBackoff::default(),
            max_delay: Some(Duration::minutes(5)),
        }
    }
}

impl RetryPolicy {
    /// Create a new retry policy with default settings
    pub fn new() -> Self {
        Self::default()
    }

    /// Set maximum retry attempts
    pub fn with_max_retries(mut self, max_retries: usize) -> Self {
        self.max_retries = max_retries;
        self
    }

    /// Set backoff strategy
    pub fn with_backoff(mut self, backoff: RetryBackoff) -> Self {
        self.backoff = backoff;
        self
    }

    /// Set maximum delay
    pub fn with_max_delay(mut self, max_delay: Duration) -> Self {
        self.max_delay = Some(max_delay);
        self
    }

    /// Calculate next retry time
    pub fn next_retry_at(&self, attempt: usize, from: DateTime<Utc>) -> DateTime<Utc> {
        if attempt >= self.max_retries {
            return from + Duration::days(365); // Far future
        }

        let delay = match self.backoff {
            RetryBackoff::Fixed(duration) => duration,
            RetryBackoff::Linear { initial, increment } => initial + (increment * attempt as i32),
            RetryBackoff::Exponential {
                initial,
                multiplier,
            } => {
                let seconds = initial.num_seconds() as f64 * multiplier.powi(attempt as i32);
                Duration::seconds(seconds as i64)
            }
            RetryBackoff::ExponentialWithJitter {
                initial,
                multiplier,
                jitter_factor,
            } => {
                let base_seconds = initial.num_seconds() as f64 * multiplier.powi(attempt as i32);
                let jitter = base_seconds * jitter_factor;
                let mut rng = rand::thread_rng();
                let jittered = base_seconds + rng.gen_range(-jitter..=jitter);
                Duration::seconds(jittered.max(0.0) as i64)
            }
        };

        let delay = if let Some(max) = self.max_delay {
            delay.min(max)
        } else {
            delay
        };

        from + delay
    }

    /// Check if should retry
    pub fn should_retry(&self, attempt: usize) -> bool {
        attempt < self.max_retries
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_retry_policy_default() {
        let policy = RetryPolicy::default();
        assert_eq!(policy.max_retries, 3);
        assert!(policy.should_retry(0));
        assert!(policy.should_retry(2));
        assert!(!policy.should_retry(3));
    }

    #[test]
    fn test_next_retry_exponential() {
        let policy = RetryPolicy::new().with_backoff(RetryBackoff::Exponential {
            initial: Duration::seconds(1),
            multiplier: 2.0,
        });

        let now = Utc::now();
        let retry1 = policy.next_retry_at(0, now);
        let retry2 = policy.next_retry_at(1, now);
        let retry3 = policy.next_retry_at(2, now);

        assert_eq!(retry1 - now, Duration::seconds(1));
        assert_eq!(retry2 - now, Duration::seconds(2));
        assert_eq!(retry3 - now, Duration::seconds(4));
    }

    #[test]
    fn test_next_retry_linear() {
        let policy = RetryPolicy::new().with_backoff(RetryBackoff::Linear {
            initial: Duration::seconds(1),
            increment: Duration::seconds(2),
        });

        let now = Utc::now();
        let retry1 = policy.next_retry_at(0, now);
        let retry2 = policy.next_retry_at(1, now);
        let retry3 = policy.next_retry_at(2, now);

        assert_eq!(retry1 - now, Duration::seconds(1));
        assert_eq!(retry2 - now, Duration::seconds(3));
        assert_eq!(retry3 - now, Duration::seconds(5));
    }

    #[test]
    fn test_max_delay() {
        let policy = RetryPolicy::new()
            .with_backoff(RetryBackoff::Exponential {
                initial: Duration::seconds(1),
                multiplier: 10.0,
            })
            .with_max_delay(Duration::seconds(5));

        let now = Utc::now();
        let retry = policy.next_retry_at(10, now);

        assert!((retry - now).num_seconds() <= 5);
    }
}
