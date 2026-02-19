use crate::error::EffectError;
use crate::types::effect::Effect;
use std::collections::HashMap;
use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;
use tokio::sync::{Mutex, Semaphore};

/// Bulkhead pattern for isolating failures in different resource pools
///
/// The bulkhead pattern isolates different parts of the system into separate pools
/// so that failure in one pool doesn't exhaust resources in another pool.
///
/// # Example
/// ```rust,no_run
/// use effect::Effect;
/// use effect::services::bulkhead::BulkheadConfig;
///
/// let config = BulkheadConfig::new("database-pool")
///     .max_concurrent(10)
///     .max_waiters(20);
///
/// let effect = Effect::success(42)
///     .with_bulkhead(config);
/// ```
#[derive(Debug, Clone)]
pub struct BulkheadConfig {
    pub name: String,
    pub max_concurrent: usize,
    pub max_waiters: usize,
}

impl BulkheadConfig {
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            max_concurrent: 10,
            max_waiters: 100,
        }
    }

    pub fn max_concurrent(mut self, value: usize) -> Self {
        self.max_concurrent = value;
        self
    }

    pub fn max_waiters(mut self, value: usize) -> Self {
        self.max_waiters = value;
        self
    }
}

/// Global registry of bulkhead semaphores
#[derive(Debug)]
pub struct BulkheadRegistry {
    pools: Arc<Mutex<HashMap<String, Arc<Semaphore>>>>,
}

impl BulkheadRegistry {
    pub fn new() -> Self {
        Self {
            pools: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    async fn get_or_create_pool(&self, config: &BulkheadConfig) -> Arc<Semaphore> {
        let mut pools = self.pools.lock().await;
        pools
            .entry(config.name.clone())
            .or_insert_with(|| Arc::new(Semaphore::new(config.max_concurrent)))
            .clone()
    }
}

impl Default for BulkheadRegistry {
    fn default() -> Self {
        Self::new()
    }
}

/// Bulkhead extension trait for effects
pub trait BulkheadExt<T, E, R> {
    /// Apply bulkhead pattern to limit concurrent executions
    fn with_bulkhead(self, config: BulkheadConfig) -> Effect<T, E, R>;
}

impl<T, E, R> BulkheadExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_bulkhead(self, config: BulkheadConfig) -> Effect<T, E, R> {
        let registry = Arc::new(BulkheadRegistry::new());

        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let config = config.clone();
            let registry = registry.clone();

            Box::pin(async move {
                let pool = registry.get_or_create_pool(&config).await;

                // Try to acquire permit
                let result = match pool.try_acquire() {
                    Ok(permit) => {
                        // We got a permit, execute the effect
                        let result = effect.run(ctx).await;
                        drop(permit);
                        result
                    }
                    Err(_) => {
                        // No permit available, bulkhead is full
                        Err(EffectError::EffectFailed(format!(
                            "Bulkhead '{}' is full (max_concurrent: {})",
                            config.name, config.max_concurrent
                        ))
                        .into())
                    }
                };
                result
            })
        })
    }
}

/// Bulkhead with waiting support (blocking until permit available)
pub trait BulkheadWaitExt<T, E, R> {
    /// Apply bulkhead pattern with waiting for permit
    fn with_bulkhead_wait(self, config: BulkheadConfig, timeout: std::time::Duration) -> Effect<T, E, R>;
}

impl<T, E, R> BulkheadWaitExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_bulkhead_wait(self, config: BulkheadConfig, timeout: std::time::Duration) -> Effect<T, E, R> {
        let registry = Arc::new(BulkheadRegistry::new());

        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let config = config.clone();
            let registry = registry.clone();

            Box::pin(async move {
                let pool = registry.get_or_create_pool(&config).await;

                // Try to acquire permit with timeout
                let result = match tokio::time::timeout(timeout, pool.acquire()).await {
                    Ok(Ok(permit)) => {
                        let result = effect.run(ctx).await;
                        drop(permit);
                        result
                    }
                    Ok(Err(_)) => {
                        Err(EffectError::EffectFailed("Semaphore closed".to_string()).into())
                    }
                    Err(_) => {
                        Err(EffectError::EffectFailed(format!(
                            "Timeout waiting for bulkhead '{}' permit",
                            config.name
                        ))
                        .into())
                    }
                };
                result
            })
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::Duration;

    #[tokio::test]
    async fn test_bulkhead_limits_concurrent() {
        let config = BulkheadConfig::new("test-pool").max_concurrent(2);

        let counter = Arc::new(Mutex::new(0));
        let counter_clone = counter.clone();

        let effect = Effect::<i32, EffectError, ()>::new(move |_| {
            let counter = counter_clone.clone();
            Box::pin(async move {
                let mut guard = counter.lock().await;
                *guard += 1;
                tokio::time::sleep(Duration::from_millis(50)).await;
                Ok(*guard)
            })
        })
        .with_bulkhead(config);

        // Run 5 effects concurrently
        let futures: Vec<_> = (0..5).map(|_| effect.clone().run(())).collect();
        let results = futures::future::join_all(futures).await;

        // Some should fail due to bulkhead being full
        let success_count = results.iter().filter(|r| r.is_ok()).count();
        let error_count = results.iter().filter(|r| r.is_err()).count();

        assert_eq!(success_count, 2, "Should allow exactly max_concurrent successes");
        assert_eq!(error_count, 3, "Should fail the rest");
    }

    #[tokio::test]
    async fn test_bulkhead_wait_with_timeout() {
        let config = BulkheadConfig::new("test-pool-wait").max_concurrent(1);

        let effect = Effect::<i32, EffectError, ()>::new(|_| {
            Box::pin(async move {
                tokio::time::sleep(Duration::from_millis(100)).await;
                Ok(42)
            })
        })
        .with_bulkhead_wait(config, Duration::from_millis(10));

        // First effect takes the permit
        let handle1 = tokio::spawn(effect.clone().run(()));
        tokio::time::sleep(Duration::from_millis(5)).await;

        // Second effect should timeout waiting
        let result2 = effect.clone().run(()).await;

        let result1 = handle1.await.unwrap();

        assert!(result1.is_ok());
        assert!(result2.is_err());
        assert!(result2.unwrap_err().to_string().contains("Timeout"));
    }
}
