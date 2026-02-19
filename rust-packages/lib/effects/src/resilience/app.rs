use crate::resilience::components::{DefaultCircuitBreaker, SimpleBatchProcessor, TokenBucketLimiter};
use crate::resilience::config::AppConfig;
use crate::resilience::error::{ResilienceError as Error, Result};
use crate::resilience::services::rate::InMemoryStorage;
use crate::resilience::services::{
    BatchProcessor, CircuitBreaker, ExponentialBackoffRetry, InMemoryQueue, Queue, RateLimiter,
    Storage,
};
use std::sync::Arc;

pub struct ResilienceApp<T> {
    batch_processor: Arc<dyn BatchProcessor<T>>,
    queue: Arc<dyn Queue<T>>,
    circuit_breaker: DefaultCircuitBreaker,
    rate_limiter: Arc<dyn RateLimiter>,
}

impl<T: Send + Sync + Clone + 'static> ResilienceApp<T> {
    pub fn new(config: AppConfig) -> Result<Self> {
        let batch_processor = Arc::new(SimpleBatchProcessor::new());
        let queue = Arc::new(InMemoryQueue::new(config.queue.capacity));

        let circuit_state = Arc::new(
            crate::resilience::components::circuit::circuit_breaker_state::CircuitBreakerState::new(
                config.circuit,
            ),
        );
        let retry_policy = Arc::new(ExponentialBackoffRetry::new(
            config.retry.max_attempts,
            config.retry.backoff_ms,
        ));
        let circuit_breaker = DefaultCircuitBreaker::new(circuit_state).with_retry(retry_policy);

        let storage = Arc::new(InMemoryStorage::new());
        let rate_limiter = Arc::new(TokenBucketLimiter::new(config.rate, storage));

        Ok(Self {
            batch_processor,
            queue,
            circuit_breaker,
            rate_limiter,
        })
    }

    pub fn batch_processor(&self) -> Arc<dyn BatchProcessor<T>> {
        Arc::clone(&self.batch_processor)
    }

    pub fn queue(&self) -> Arc<dyn Queue<T>> {
        Arc::clone(&self.queue)
    }

    pub fn circuit_breaker(&self) -> &DefaultCircuitBreaker {
        &self.circuit_breaker
    }

    pub fn rate_limiter(&self) -> Arc<dyn RateLimiter> {
        Arc::clone(&self.rate_limiter)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_app_creation() {
        let config = AppConfig::default();
        let app = ResilienceApp::<String>::new(config);
        assert!(app.is_ok());
    }
}
