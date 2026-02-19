//! Retry logic with exponential backoff
//!
//! This module provides retry functionality for AI model requests.

use crate::error::{AiModelsError, Result};
use std::time::Duration;
use tokio::time::sleep;

/// Retry configuration
#[derive(Debug, Clone)]
pub struct RetryConfig {
    pub max_attempts: u32,
    pub initial_delay: Duration,
    pub max_delay: Duration,
    pub backoff_multiplier: f64,
}

impl Default for RetryConfig {
    fn default() -> Self {
        Self {
            max_attempts: 3,
            initial_delay: Duration::from_millis(1000),
            max_delay: Duration::from_secs(10),
            backoff_multiplier: 2.0,
        }
    }
}

impl RetryConfig {
    pub fn new(max_attempts: u32) -> Self {
        Self {
            max_attempts,
            ..Default::default()
        }
    }

    pub fn with_initial_delay(mut self, delay: Duration) -> Self {
        self.initial_delay = delay;
        self
    }

    pub fn with_max_delay(mut self, delay: Duration) -> Self {
        self.max_delay = delay;
        self
    }

    pub fn with_backoff_multiplier(mut self, multiplier: f64) -> Self {
        self.backoff_multiplier = multiplier;
        self
    }
}

/// Check if an error is retryable
pub fn is_retryable_error(error: &AiModelsError) -> bool {
    match error {
        AiModelsError::Timeout { .. } => true,
        AiModelsError::NetworkError(_) => true,
        AiModelsError::ReqwestError(_) => true,
        AiModelsError::RateLimitExceeded { .. } => true,
        AiModelsError::ProviderError { .. } => true,
        _ => false,
    }
}

/// Execute a function with retry logic
pub async fn retry_with_backoff<F, T, Fut>(config: &RetryConfig, mut operation: F) -> Result<T>
where
    F: FnMut() -> Fut,
    Fut: std::future::Future<Output = Result<T>>,
{
    let mut attempt = 0;
    let mut delay = config.initial_delay;

    loop {
        attempt += 1;

        match operation().await {
            Ok(result) => return Ok(result),
            Err(error) => {
                if attempt >= config.max_attempts || !is_retryable_error(&error) {
                    return Err(AiModelsError::RetryExhausted { attempts: attempt });
                }

                tracing::warn!(
                    "Attempt {}/{} failed: {}, retrying in {:?}",
                    attempt,
                    config.max_attempts,
                    error,
                    delay
                );

                sleep(delay).await;
                delay = std::cmp::min(
                    Duration::from_millis(
                        (delay.as_millis() as f64 * config.backoff_multiplier) as u64,
                    ),
                    config.max_delay,
                );
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_retry_success() {
        let config = RetryConfig::new(3);
        let mut attempts = 0;

        let result = retry_with_backoff(&config, || {
            attempts += 1;
            async move {
                if attempts < 2 {
                    Err(AiModelsError::Timeout { seconds: 30 })
                } else {
                    Ok("success".to_string())
                }
            }
        })
        .await;

        assert!(result.is_ok());
        assert_eq!(attempts, 2);
    }

    #[tokio::test]
    async fn test_retry_exhausted() {
        let config = RetryConfig::new(2);

        let result = retry_with_backoff(&config, || async move {
            Err(AiModelsError::Timeout { seconds: 30 })
        })
        .await;

        assert!(result.is_err());
        match result.unwrap_err() {
            AiModelsError::RetryExhausted { attempts } => {
                assert_eq!(attempts, 2);
            }
            _ => panic!("Expected RetryExhausted error"),
        }
    }
}
