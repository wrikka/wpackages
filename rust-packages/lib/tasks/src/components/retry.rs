//! Retry policies for task execution

use std::time::Duration;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BackoffStrategy {
    Fixed(Duration),
    Exponential {
        initial: Duration,
        multiplier: f64,
    },
    Linear {
        initial: Duration,
        increment: Duration,
    },
}

impl Default for BackoffStrategy {
    fn default() -> Self {
        BackoffStrategy::Exponential {
            initial: Duration::from_millis(100),
            multiplier: 2.0,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct RetryPolicy {
    pub max_attempts: usize,
    pub backoff_strategy: BackoffStrategy,
}

impl RetryPolicy {
    pub fn new(max_attempts: usize) -> Self {
        Self {
            max_attempts,
            backoff_strategy: BackoffStrategy::default(),
        }
    }

    pub fn with_fixed_backoff(mut self, duration: Duration) -> Self {
        self.backoff_strategy = BackoffStrategy::Fixed(duration);
        self
    }

    pub fn with_exponential_backoff(mut self, initial: Duration, multiplier: f64) -> Self {
        self.backoff_strategy = BackoffStrategy::Exponential {
            initial,
            multiplier,
        };
        self
    }

    pub fn with_linear_backoff(mut self, initial: Duration, increment: Duration) -> Self {
        self.backoff_strategy = BackoffStrategy::Linear { initial, increment };
        self
    }

    pub fn compute_backoff(&self, attempt: usize) -> Duration {
        match self.backoff_strategy {
            BackoffStrategy::Fixed(duration) => duration,
            BackoffStrategy::Exponential {
                initial,
                multiplier,
            } => {
                let delay_ms = initial.as_millis() as f64 * multiplier.powi(attempt as i32 - 1);
                Duration::from_millis(delay_ms as u64)
            }
            BackoffStrategy::Linear { initial, increment } => {
                let delay = initial + increment * (attempt as u32 - 1);
                delay
            }
        }
    }
}

impl Default for RetryPolicy {
    fn default() -> Self {
        Self::new(3)
    }
}
