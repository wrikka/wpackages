use crate::resilience::config::CircuitConfig;
use crate::resilience::error::Result;
use crate::resilience::types::{CircuitState, CircuitStats};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

pub fn create_circuit_stats(
    state: CircuitState,
    failure_count: u32,
    success_count: u32,
    last_failure_time: Option<u64>,
    last_success_time: Option<u64>,
) -> CircuitStats {
    CircuitStats {
        state,
        failure_count,
        success_count,
        last_failure_time,
        last_success_time,
    }
}

pub struct CircuitBreakerState {
    state: Arc<tokio::sync::RwLock<CircuitState>>,
    failure_count: Arc<std::sync::atomic::AtomicU32>,
    success_count: Arc<std::sync::atomic::AtomicU32>,
    last_failure_time: Arc<tokio::sync::RwLock<Option<u64>>>,
    last_success_time: Arc<tokio::sync::RwLock<Option<u64>>>,
    config: CircuitConfig,
}

impl CircuitBreakerState {
    pub fn new(config: CircuitConfig) -> Self {
        Self {
            state: Arc::new(tokio::sync::RwLock::new(CircuitState::Closed)),
            failure_count: Arc::new(std::sync::atomic::AtomicU32::new(0)),
            success_count: Arc::new(std::sync::atomic::AtomicU32::new(0)),
            last_failure_time: Arc::new(tokio::sync::RwLock::new(None)),
            last_success_time: Arc::new(tokio::sync::RwLock::new(None)),
            config,
        }
    }

    pub async fn should_attempt(&self) -> bool {
        let state = self.state.read().await;
        matches!(*state, CircuitState::Closed | CircuitState::HalfOpen)
    }

    pub async fn record_success(&self) -> Result<()> {
        self.failure_count
            .store(0, std::sync::atomic::Ordering::SeqCst);
        self.success_count
            .fetch_add(1, std::sync::atomic::Ordering::SeqCst);

        let mut state = self.state.write().await;
        *state = CircuitState::Closed;
        Ok(())
    }

    pub async fn record_failure(&self) -> Result<()> {
        let failures = self
            .failure_count
            .fetch_add(1, std::sync::atomic::Ordering::SeqCst)
            + 1;

        if failures >= self.config.failure_threshold {
            let mut state = self.state.write().await;
            *state = CircuitState::Open;
            let mut last_failure = self.last_failure_time.write().await;
            *last_failure = Some(
                SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap()
                    .as_secs(),
            );
        }
        Ok(())
    }

    pub async fn state(&self) -> CircuitState {
        let state = self.state.read().await;
        *state
    }

    pub async fn stats(&self) -> CircuitStats {
        let state = self.state.read().await;
        let failure_count = self.failure_count.load(std::sync::atomic::Ordering::SeqCst);
        let success_count = self.success_count.load(std::sync::atomic::Ordering::SeqCst);
        let last_failure = self.last_failure_time.read().await;
        let last_success = self.last_success_time.read().await;

        create_circuit_stats(
            *state,
            failure_count,
            success_count,
            *last_failure,
            *last_success,
        )
    }

    pub async fn reset_counts(&self) {
        self.failure_count
            .store(0, std::sync::atomic::Ordering::SeqCst);
        self.success_count
            .store(0, std::sync::atomic::Ordering::SeqCst);
    }

    pub async fn transition_to(&self, new_state: CircuitState) -> Result<()> {
        let mut state = self.state.write().await;
        *state = new_state;
        Ok(())
    }
}
