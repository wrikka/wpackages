//! Adaptive retry support (requires `shadow-traffic` or `property-testing` feature for jitter)

use crate::error::EffectError;
use crate::types::effect::Effect;
use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::Mutex;

/// Retry strategy with exponential backoff and jitter
#[derive(Debug, Clone)]
pub enum RetryStrategy {
    Fixed { delay: Duration },
    Linear { initial: Duration, increment: Duration },
    Exponential { initial: Duration, max_delay: Duration, factor: f64 },
    ExponentialWithJitter { initial: Duration, max_delay: Duration, factor: f64, jitter: f64 },
}

impl RetryStrategy {
    /// Calculate delay for a given attempt
    fn calculate_delay(&self, attempt: u32) -> Duration {
        match self {
            RetryStrategy::Fixed { delay } => *delay,
            RetryStrategy::Linear { initial, increment } => {
                *initial + *increment * attempt
            }
            RetryStrategy::Exponential { initial, max_delay, factor } => {
                let delay_ms = initial.as_millis() as f64 * factor.powi(attempt as i32);
                let delay_ms = delay_ms.min(max_delay.as_millis() as f64) as u64;
                Duration::from_millis(delay_ms)
            }
            RetryStrategy::ExponentialWithJitter { initial, max_delay, factor, jitter } => {
                let base_ms = initial.as_millis() as f64 * factor.powi(attempt as i32);
                let base_ms = base_ms.min(max_delay.as_millis() as f64);
                #[cfg(feature = "rand")]
                {
                    let jitter_ms = base_ms * jitter * (rand::random::<f64>() - 0.5);
                    let delay_ms = (base_ms + jitter_ms).max(0.0) as u64;
                    Duration::from_millis(delay_ms)
                }
                #[cfg(not(feature = "rand"))]
                {
                    Duration::from_millis(base_ms as u64)
                }
            }
        }
    }
}

/// Adaptive retry configuration
#[derive(Debug, Clone)]
pub struct AdaptiveRetryConfig {
    pub max_attempts: u32,
    pub strategy: RetryStrategy,
    pub retryable_errors: Vec<String>,
    pub circuit_break_after: Option<u32>, // Enable circuit breaker after N consecutive failures
}

impl Default for AdaptiveRetryConfig {
    fn default() -> Self {
        Self {
            max_attempts: 3,
            strategy: RetryStrategy::ExponentialWithJitter {
                initial: Duration::from_millis(100),
                max_delay: Duration::from_secs(10),
                factor: 2.0,
                jitter: 0.1,
            },
            retryable_errors: vec![],
            circuit_break_after: None,
        }
    }
}

impl AdaptiveRetryConfig {
    pub fn new(max_attempts: u32) -> Self {
        Self {
            max_attempts,
            ..Default::default()
        }
    }

    pub fn with_strategy(mut self, strategy: RetryStrategy) -> Self {
        self.strategy = strategy;
        self
    }

    pub fn with_retryable_errors(mut self, errors: Vec<String>) -> Self {
        self.retryable_errors = errors;
        self
    }
}

/// Adaptive retry extension trait
pub trait AdaptiveRetryExt<T, E, R> {
    /// Apply adaptive retry with exponential backoff and jitter
    fn with_adaptive_retry(self, config: AdaptiveRetryConfig) -> Effect<T, E, R>;

    /// Quick setup for exponential backoff with jitter
    fn with_exponential_jitter(self, max_attempts: u32, initial_delay: Duration) -> Effect<T, E, R>;
}

impl<T, E, R> AdaptiveRetryExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + std::fmt::Display + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_adaptive_retry(self, config: AdaptiveRetryConfig) -> Effect<T, E, R> {
        let failure_count = Arc::new(Mutex::new(0u32));

        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let config = config.clone();
            let failure_count = failure_count.clone();

            Box::pin(async move {
                let mut last_error: Option<E> = None;

                for attempt in 0..config.max_attempts {
                    match effect.clone().run(ctx.clone()).await {
                        Ok(value) => {
                            // Reset failure count on success
                            let mut count = failure_count.lock().await;
                            *count = 0;
                            return Ok(value);
                        }
                        Err(e) => {
                            // Check if error is retryable
                            let error_str = e.to_string();
                            let is_retryable = config.retryable_errors.is_empty()
                                || config.retryable_errors.iter().any(|re| error_str.contains(re));

                            if !is_retryable || attempt >= config.max_attempts - 1 {
                                return Err(e);
                            }

                            last_error = Some(e);

                            // Update failure count
                            let mut count = failure_count.lock().await;
                            *count += 1;

                            // Check circuit breaker
                            if let Some(threshold) = config.circuit_break_after {
                                if *count >= threshold {
                                    return Err(EffectError::EffectFailed(
                                        "Circuit breaker opened due to consecutive failures".to_string()
                                    ).into());
                                }
                            }
                            drop(count);

                            // Calculate and apply delay
                            let delay = config.strategy.calculate_delay(attempt);
                            tokio::time::sleep(delay).await;
                        }
                    }
                }

                Err(last_error.unwrap_or_else(|| {
                    EffectError::EffectFailed("Max retries exceeded".to_string()).into()
                }))
            })
        })
    }

    fn with_exponential_jitter(self, max_attempts: u32, initial_delay: Duration) -> Effect<T, E, R> {
        let config = AdaptiveRetryConfig {
            max_attempts,
            strategy: RetryStrategy::ExponentialWithJitter {
                initial: initial_delay,
                max_delay: Duration::from_secs(30),
                factor: 2.0,
                jitter: 0.1,
            },
            ..Default::default()
        };
        self.with_adaptive_retry(config)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_adaptive_retry_success() {
        let attempts = Arc::new(Mutex::new(0));
        let attempts_clone = attempts.clone();

        let config = AdaptiveRetryConfig::new(3);

        let effect = Effect::<i32, EffectError, ()>::new(move |_| {
            let attempts = attempts_clone.clone();
            Box::pin(async move {
                let mut guard = attempts.lock().await;
                *guard += 1;
                if *guard < 3 {
                    Err(EffectError::EffectFailed("temp".to_string()))
                } else {
                    Ok(42)
                }
            })
        })
        .with_adaptive_retry(config);

        let result = effect.run(()).await;
        assert_eq!(result.unwrap(), 42);
    }

    #[tokio::test]
    async fn test_exponential_jitter() {
        let attempts = Arc::new(Mutex::new(0));
        let attempts_clone = attempts.clone();

        let effect = Effect::<i32, EffectError, ()>::new(move |_| {
            let attempts = attempts_clone.clone();
            Box::pin(async move {
                let mut guard = attempts.lock().await;
                *guard += 1;
                Err(EffectError::EffectFailed("error".to_string()))
            })
        })
        .with_exponential_jitter(3, Duration::from_millis(10));

        let start = std::time::Instant::now();
        let _ = effect.run(()).await;
        let elapsed = start.elapsed();

        // Should have some delay from retries
        assert!(elapsed > Duration::from_millis(10));
    }
}
