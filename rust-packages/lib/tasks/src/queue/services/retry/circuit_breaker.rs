//! Circuit breaker for retry management

use chrono::{DateTime, Utc};
use dashmap::DashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};

/// Circuit breaker state
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum CircuitState {
    Closed,
    Open,
    HalfOpen,
}

/// Circuit breaker configuration
#[derive(Debug, Clone)]
pub struct CircuitBreakerConfig {
    /// Number of failures before opening the circuit
    pub failure_threshold: usize,
    /// Time to wait before attempting to close the circuit
    pub recovery_timeout: Duration,
    /// Number of successes before closing the circuit in half-open state
    pub success_threshold: usize,
}

impl Default for CircuitBreakerConfig {
    fn default() -> Self {
        Self {
            failure_threshold: 5,
            recovery_timeout: Duration::from_secs(60),
            success_threshold: 2,
        }
    }
}

/// Circuit breaker for preventing cascading failures
pub struct CircuitBreaker {
    state: Arc<tokio::sync::Mutex<CircuitState>>,
    failure_count: Arc<tokio::sync::Mutex<usize>>,
    success_count: Arc<tokio::sync::Mutex<usize>>,
    last_failure_time: Arc<tokio::sync::Mutex<Option<Instant>>>,
    config: CircuitBreakerConfig,
}

impl CircuitBreaker {
    /// Create a new circuit breaker with default config
    pub fn new() -> Self {
        Self::with_config(CircuitBreakerConfig::default())
    }

    /// Create a new circuit breaker with custom config
    pub fn with_config(config: CircuitBreakerConfig) -> Self {
        Self {
            state: Arc::new(tokio::sync::Mutex::new(CircuitState::Closed)),
            failure_count: Arc::new(tokio::sync::Mutex::new(0)),
            success_count: Arc::new(tokio::sync::Mutex::new(0)),
            last_failure_time: Arc::new(tokio::sync::Mutex::new(None)),
            config,
        }
    }

    /// Check if the circuit allows execution
    pub async fn allows_execution(&self) -> bool {
        let mut state = self.state.lock().await;

        match *state {
            CircuitState::Closed => true,
            CircuitState::Open => {
                // Check if recovery timeout has passed
                if let Some(last_failure) = *self.last_failure_time.lock().await {
                    if last_failure.elapsed() > self.config.recovery_timeout {
                        *state = CircuitState::HalfOpen;
                        *self.success_count.lock().await = 0;
                        true
                    } else {
                        false
                    }
                } else {
                    false
                }
            }
            CircuitState::HalfOpen => true,
        }
    }

    /// Record a successful execution
    pub async fn record_success(&self) {
        let mut state = self.state.lock().await;

        if *state == CircuitState::HalfOpen {
            let mut success_count = self.success_count.lock().await;
            *success_count += 1;

            if *success_count >= self.config.success_threshold {
                *state = CircuitState::Closed;
                *self.failure_count.lock().await = 0;
                *success_count = 0;
            }
        } else if *state == CircuitState::Closed {
            *self.failure_count.lock().await = 0;
        }
    }

    /// Record a failed execution
    pub async fn record_failure(&self) {
        let mut state = self.state.lock().await;

        let mut failure_count = self.failure_count.lock().await;
        *failure_count += 1;
        *self.last_failure_time.lock().await = Some(Instant::now());

        if *failure_count >= self.config.failure_threshold {
            *state = CircuitState::Open;
        }
    }

    /// Get current circuit state
    pub async fn state(&self) -> CircuitState {
        *self.state.lock().await
    }

    /// Reset the circuit breaker to closed state
    pub async fn reset(&self) {
        *self.state.lock().await = CircuitState::Closed;
        *self.failure_count.lock().await = 0;
        *self.success_count.lock().await = 0;
        *self.last_failure_time.lock().await = None;
    }
}

impl Default for CircuitBreaker {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_circuit_breaker_closed() {
        let breaker = CircuitBreaker::new();
        assert!(breaker.allows_execution().await);
    }

    #[tokio::test]
    async fn test_circuit_breaker_opens_after_failures() {
        let config = CircuitBreakerConfig {
            failure_threshold: 3,
            recovery_timeout: Duration::from_secs(1),
            success_threshold: 2,
        };
        let breaker = CircuitBreaker::with_config(config);

        // Record failures
        breaker.record_failure().await;
        breaker.record_failure().await;
        breaker.record_failure().await;

        // Circuit should be open
        assert!(!breaker.allows_execution().await);
        assert_eq!(breaker.state().await, CircuitState::Open);
    }

    #[tokio::test]
    async fn test_circuit_breaker_recovers() {
        let config = CircuitBreakerConfig {
            failure_threshold: 2,
            recovery_timeout: Duration::from_millis(100),
            success_threshold: 1,
        };
        let breaker = CircuitBreaker::with_config(config);

        // Open the circuit
        breaker.record_failure().await;
        breaker.record_failure().await;
        assert!(!breaker.allows_execution().await);

        // Wait for recovery timeout
        tokio::time::sleep(Duration::from_millis(150)).await;

        // Circuit should be half-open
        assert!(breaker.allows_execution().await);
        assert_eq!(breaker.state().await, CircuitState::HalfOpen);

        // Record success
        breaker.record_success().await;

        // Circuit should be closed
        assert_eq!(breaker.state().await, CircuitState::Closed);
    }
}
