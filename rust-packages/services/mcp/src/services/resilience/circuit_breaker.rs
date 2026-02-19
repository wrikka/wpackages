use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;
use tracing::{debug, warn};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CircuitState {
    Closed,
    Open,
    HalfOpen,
}

#[derive(Debug, Clone)]
pub struct CircuitBreakerConfig {
    pub failure_threshold: usize,
    pub success_threshold: usize,
    pub timeout: Duration,
    pub half_open_max_calls: usize,
}

impl Default for CircuitBreakerConfig {
    fn default() -> Self {
        Self {
            failure_threshold: 5,
            success_threshold: 2,
            timeout: Duration::from_secs(60),
            half_open_max_calls: 3,
        }
    }
}

#[derive(Clone)]
pub struct CircuitBreaker {
    state: Arc<RwLock<CircuitState>>,
    config: CircuitBreakerConfig,
    failure_count: Arc<RwLock<usize>>,
    success_count: Arc<RwLock<usize>>,
    last_failure_time: Arc<RwLock<Option<Instant>>>,
    half_open_calls: Arc<RwLock<usize>>,
}

impl CircuitBreaker {
    pub fn new(config: CircuitBreakerConfig) -> Self {
        Self {
            state: Arc::new(RwLock::new(CircuitState::Closed)),
            config,
            failure_count: Arc::new(RwLock::new(0)),
            success_count: Arc::new(RwLock::new(0)),
            last_failure_time: Arc::new(RwLock::new(None)),
            half_open_calls: Arc::new(RwLock::new(0)),
        }
    }

    pub async fn state(&self) -> CircuitState {
        *self.state.read().await
    }

    pub async fn call<F, T, E>(&self, f: F) -> Result<T, E>
    where
        F: FnOnce() -> Result<T, E>,
    {
        let state = self.state().await;

        match state {
            CircuitState::Open => {
                if self.should_attempt_reset().await {
                    self.transition_to_half_open().await;
                } else {
                    return Err(self.circuit_open_error());
                }
            }
            CircuitState::HalfOpen => {
                let calls = *self.half_open_calls.read().await;
                if calls >= self.config.half_open_max_calls {
                    return Err(self.circuit_open_error());
                }
            }
            CircuitState::Closed => {}
        }

        let result = f();

        match result {
            Ok(value) => {
                self.on_success().await;
                Ok(value)
            }
            Err(error) => {
                self.on_failure().await;
                Err(error)
            }
        }
    }

    async fn should_attempt_reset(&self) -> bool {
        if let Some(last_failure) = *self.last_failure_time.read().await {
            Instant::now().duration_since(last_failure) >= self.config.timeout
        } else {
            false
        }
    }

    async fn transition_to_half_open(&self) {
        debug!("Circuit breaker transitioning to half-open");
        *self.state.write().await = CircuitState::HalfOpen;
        *self.half_open_calls.write().await = 0;
    }

    async fn on_success(&self) {
        let state = self.state().await;

        match state {
            CircuitState::HalfOpen => {
                let mut count = self.success_count.write().await;
                *count += 1;

                if *count >= self.config.success_threshold {
                    debug!("Circuit breaker closing after successful recovery");
                    *self.state.write().await = CircuitState::Closed;
                    *self.failure_count.write().await = 0;
                    *self.success_count.write().await = 0;
                    *self.half_open_calls.write().await = 0;
                }
            }
            CircuitState::Closed => {
                *self.failure_count.write().await = 0;
            }
            CircuitState::Open => {}
        }
    }

    async fn on_failure(&self) {
        let state = self.state().await;

        match state {
            CircuitState::Closed => {
                let mut count = self.failure_count.write().await;
                *count += 1;

                if *count >= self.config.failure_threshold {
                    warn!("Circuit breaker opening after {} failures", *count);
                    *self.state.write().await = CircuitState::Open;
                    *self.last_failure_time.write().await = Some(Instant::now());
                }
            }
            CircuitState::HalfOpen => {
                warn!("Circuit breaker re-opening after failure in half-open state");
                *self.state.write().await = CircuitState::Open;
                *self.last_failure_time.write().await = Some(Instant::now());
                *self.success_count.write().await = 0;
                *self.half_open_calls.write().await = 0;
            }
            CircuitState::Open => {}
        }
    }

    fn circuit_open_error<E>(&self) -> E {
        #[derive(Debug)]
        struct CircuitOpenError;

        impl std::fmt::Display for CircuitOpenError {
            fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                write!(f, "Circuit breaker is open")
            }
        }

        impl std::error::Error for CircuitOpenError {}

        panic!("Circuit breaker error handling not implemented for this error type");
    }
}
