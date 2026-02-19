use crate::resilience::components::circuit::circuit_breaker_state::CircuitBreakerState;
use crate::resilience::config::CircuitConfig;
use crate::resilience::error::{ResilienceError as Error, Result};
use crate::resilience::services::circuit::{CircuitBreaker, ExponentialBackoffRetry, RetryPolicy};
use crate::resilience::types::{CircuitState, CircuitStats};
use std::sync::Arc;

pub struct DefaultCircuitBreaker {
    state: Arc<CircuitBreakerState>,
    retry_policy: Option<Arc<dyn RetryPolicy>>,
}

impl DefaultCircuitBreaker {
    pub fn new(state: Arc<CircuitBreakerState>) -> Self {
        Self {
            state,
            retry_policy: None,
        }
    }

    pub fn with_retry(mut self, retry_policy: Arc<dyn RetryPolicy>) -> Self {
        self.retry_policy = Some(retry_policy);
        self
    }
}

#[async_trait::async_trait]
impl CircuitBreaker for DefaultCircuitBreaker {
    async fn call<F, T, E>(&self, f: F) -> Result<T>
    where
        F: FnOnce() -> std::pin::Pin<
                Box<dyn std::future::Future<Output = std::result::Result<T, E>> + Send + Sync>,
            > + Send
            + Sync,
        T: Send,
        E: std::error::Error + Send + Sync + 'static,
    {
        if !self.state.should_attempt().await {
            return Err(Error::CircuitBreakerOpen);
        }

        let mut attempt = 0;
        let max_attempts = if let Some(ref retry) = self.retry_policy {
            retry.should_retry(0)
        } else {
            false
        };

        loop {
            attempt += 1;

            let result = f().await;

            match result {
                Ok(result) => {
                    self.state.record_success().await?;
                    return Ok(result);
                }
                Err(e) => {
                    self.state.record_failure().await?;

                    if !max_attempts || attempt >= 3 {
                        return Err(Error::OperationFailed(e.to_string()));
                    }

                    if let Some(ref retry) = self.retry_policy {
                        let delay = retry.backoff_ms(attempt);
                        tokio::time::sleep(tokio::time::Duration::from_millis(delay)).await;
                    }

                    return Err(Error::OperationFailed(e.to_string()));
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_execute_success() {
        let config = crate::resilience::config::CircuitConfig {
            failure_threshold: 3,
            success_threshold: 2,
            timeout_ms: 60000,
        };
        let state = Arc::new(CircuitBreakerState::new(config));
        let breaker = DefaultCircuitBreaker::new(state);

        let result = breaker
            .call(|| Box::pin(async { Ok::<_, std::io::Error>(42) }))
            .await;

        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 42);
    }

    #[tokio::test]
    async fn test_execute_failure() {
        let config = crate::resilience::config::CircuitConfig {
            failure_threshold: 3,
            success_threshold: 2,
            timeout_ms: 60000,
        };
        let state = Arc::new(CircuitBreakerState::new(config));
        let breaker = DefaultCircuitBreaker::new(state);

        for _ in 0..3 {
            let _ = breaker
                .call(|| {
                    Box::pin(async {
                        Err::<i32, std::io::Error>(std::io::Error::new(
                            std::io::ErrorKind::Other,
                            "test",
                        ))
                    })
                })
                .await;
        }

        assert_eq!(breaker.state.state().await, CircuitState::Open);
    }
}
