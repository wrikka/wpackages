use crate::error::EffectError;
use crate::types::effect::Effect;
use std::collections::HashMap;
use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::{Mutex, Semaphore, OwnedSemaphorePermit};

/// Semaphore configuration for limiting concurrent executions
#[derive(Debug, Clone)]
pub struct ConcurrencyConfig {
    pub max_concurrent: usize,
    pub name: String,
    pub timeout: Option<Duration>,
    pub fail_fast: bool,
}

impl ConcurrencyConfig {
    pub fn new(name: impl Into<String>, max_concurrent: usize) -> Self {
        Self {
            name: name.into(),
            max_concurrent,
            timeout: None,
            fail_fast: true,
        }
    }

    pub fn with_timeout(mut self, duration: Duration) -> Self {
        self.timeout = Some(duration);
        self.fail_fast = false;
        self
    }

    pub fn fail_fast(mut self) -> Self {
        self.fail_fast = true;
        self
    }

    pub fn with_wait(mut self) -> Self {
        self.fail_fast = false;
        self
    }
}

/// Global concurrency registry
#[derive(Debug, Default)]
pub struct ConcurrencyRegistry {
    semaphores: Arc<Mutex<HashMap<String, Arc<Semaphore>>>>,
}

impl ConcurrencyRegistry {
    pub fn new() -> Self {
        Self {
            semaphores: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn get_or_create(&self, config: &ConcurrencyConfig) -> Arc<Semaphore> {
        let mut semaphores = self.semaphores.lock().await;
        semaphores
            .entry(config.name.clone())
            .or_insert_with(|| Arc::new(Semaphore::new(config.max_concurrent)))
            .clone()
    }
}

/// Concurrency limit extension trait
pub trait ConcurrencyExt<T, E, R> {
    /// Limit concurrent executions with semaphore
    fn with_concurrency(self, config: ConcurrencyConfig) -> Effect<T, E, R>;

    /// Simple concurrency limit by count
    fn limit_concurrency(self, max_concurrent: usize) -> Effect<T, E, R>;

    /// Concurrency limit with named semaphore
    fn limit_concurrency_named(self, name: impl Into<String>, max_concurrent: usize) -> Effect<T, E, R>;
}

impl<T, E, R> ConcurrencyExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_concurrency(self, config: ConcurrencyConfig) -> Effect<T, E, R> {
        let registry = Arc::new(ConcurrencyRegistry::new());

        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let config = config.clone();
            let registry = registry.clone();

            Box::pin(async move {
                let semaphore = registry.get_or_create(&config).await;

                if config.fail_fast {
                    // Try to acquire immediately, fail if not available
                    match semaphore.try_acquire() {
                        Ok(permit) => {
                            let result = effect.run(ctx).await;
                            drop(permit);
                            result
                        }
                        Err(_) => Err(EffectError::EffectFailed(format!(
                            "Concurrency limit exceeded for '{}' (max: {})",
                            config.name, config.max_concurrent
                        ))
                        .into()),
                    }
                } else if let Some(timeout) = config.timeout {
                    // Wait for permit with timeout
                    match tokio::time::timeout(timeout, semaphore.acquire()).await {
                        Ok(Ok(permit)) => {
                            let result = effect.run(ctx).await;
                            drop(permit);
                            result
                        }
                        Ok(Err(_)) => Err(EffectError::EffectFailed("Semaphore closed".to_string()).into()),
                        Err(_) => Err(EffectError::EffectFailed(format!(
                            "Timeout waiting for concurrency permit for '{}'",
                            config.name
                        ))
                        .into()),
                    }
                } else {
                    // Wait indefinitely for permit
                    match semaphore.acquire().await {
                        Ok(permit) => {
                            let result = effect.run(ctx).await;
                            drop(permit);
                            result
                        }
                        Err(_) => Err(EffectError::EffectFailed("Semaphore closed".to_string()).into()),
                    }
                }
            })
        })
    }

    fn limit_concurrency(self, max_concurrent: usize) -> Effect<T, E, R> {
        self.with_concurrency(ConcurrencyConfig::new("default", max_concurrent))
    }

    fn limit_concurrency_named(self, name: impl Into<String>, max_concurrent: usize) -> Effect<T, E, R> {
        self.with_concurrency(ConcurrencyConfig::new(name, max_concurrent))
    }
}

/// Per-key concurrency limiting
pub struct KeyedConcurrencyLimiter<K> {
    semaphores: Arc<Mutex<HashMap<K, Arc<Semaphore>>>>,
    max_per_key: usize,
}

impl<K> KeyedConcurrencyLimiter<K>
where
    K: std::hash::Hash + Eq + Clone + Send + 'static,
{
    pub fn new(max_per_key: usize) -> Self {
        Self {
            semaphores: Arc::new(Mutex::new(HashMap::new())),
            max_per_key,
        }
    }

    pub async fn acquire(&self, key: K) -> Result<OwnedSemaphorePermit, EffectError> {
        let semaphore = {
            let mut semaphores = self.semaphores.lock().await;
            semaphores
                .entry(key)
                .or_insert_with(|| Arc::new(Semaphore::new(self.max_per_key)))
                .clone()
        };

        match semaphore.clone().try_acquire_owned() {
            Ok(permit) => Ok(permit),
            Err(_) => Err(EffectError::EffectFailed(
                "Keyed concurrency limit exceeded".to_string(),
            )),
        }
    }
}

/// Keyed concurrency extension trait
pub trait KeyedConcurrencyExt<T, E, R> {
    /// Limit concurrency per key
    fn with_keyed_concurrency<K, F>(self, limiter: Arc<KeyedConcurrencyLimiter<K>>, key_fn: F) -> Effect<T, E, R>
    where
        F: Fn(&R) -> K + Send + Sync + 'static,
        K: std::hash::Hash + Eq + Clone + Send + 'static;
}

impl<T, E, R> KeyedConcurrencyExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_keyed_concurrency<K, F>(self, limiter: Arc<KeyedConcurrencyLimiter<K>>, key_fn: F) -> Effect<T, E, R>
    where
        F: Fn(&R) -> K + Send + Sync + 'static,
        K: std::hash::Hash + Eq + Clone + Send + 'static,
    {
        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let limiter = limiter.clone();
            let key = key_fn(&ctx);

            Box::pin(async move {
                match limiter.acquire(key).await {
                    Ok(permit) => {
                        let result = effect.run(ctx).await;
                        drop(permit);
                        result
                    }
                    Err(e) => Err(e.into()),
                }
            })
        })
    }
}

/// Dynamic concurrency adjustment
#[derive(Debug, Clone)]
pub struct AdaptiveConcurrency {
    current_limit: Arc<Mutex<usize>>,
    min_limit: usize,
    max_limit: usize,
}

impl AdaptiveConcurrency {
    pub fn new(initial: usize, min_limit: usize, max_limit: usize) -> Self {
        Self {
            current_limit: Arc::new(Mutex::new(initial)),
            min_limit,
            max_limit,
        }
    }

    pub async fn get_limit(&self) -> usize {
        *self.current_limit.lock().await
    }

    pub async fn increase(&self) {
        let mut limit = self.current_limit.lock().await;
        if *limit < self.max_limit {
            *limit += 1;
        }
    }

    pub async fn decrease(&self) {
        let mut limit = self.current_limit.lock().await;
        if *limit > self.min_limit {
            *limit -= 1;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_concurrency_limit() {
        let config = ConcurrencyConfig::new("test", 2).fail_fast();

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
        .with_concurrency(config);

        // Run 5 effects concurrently
        let futures: Vec<_> = (0..5).map(|_| effect.clone().run(())).collect();
        let results = futures::future::join_all(futures).await;

        let success_count = results.iter().filter(|r| r.is_ok()).count();
        let error_count = results.iter().filter(|r| r.is_err()).count();

        assert_eq!(success_count, 2);
        assert_eq!(error_count, 3);
    }

    #[tokio::test]
    async fn test_concurrency_with_timeout() {
        let config = ConcurrencyConfig::new("test-wait", 1).with_timeout(Duration::from_millis(100));

        let effect = Effect::<i32, EffectError, ()>::new(|_| {
            Box::pin(async move {
                tokio::time::sleep(Duration::from_millis(200)).await;
                Ok(42)
            })
        })
        .with_concurrency(config);

        // First effect takes the permit
        let handle1 = tokio::spawn(effect.clone().run(()));
        tokio::time::sleep(Duration::from_millis(10)).await;

        // Second effect should timeout
        let result2 = effect.clone().run(()).await;

        let result1 = handle1.await.unwrap();

        assert!(result1.is_ok());
        assert!(result2.is_err());
        assert!(result2.unwrap_err().to_string().contains("Timeout"));
    }

    #[tokio::test]
    async fn test_keyed_concurrency() {
        let limiter = Arc::new(KeyedConcurrencyLimiter::<String>::new(2));

        let counter = Arc::new(Mutex::new(HashMap::<String, i32>::new()));
        let counter_clone = counter.clone();

        let effect = Effect::<i32, EffectError, String>::new(move |key: String| {
            let counter = counter_clone.clone();
            let key = key.clone();
            Box::pin(async move {
                let mut guard = counter.lock().await;
                let entry = guard.entry(key.clone()).or_insert(0);
                *entry += 1;
                let value = *entry;
                drop(guard);
                tokio::time::sleep(Duration::from_millis(50)).await;
                Ok(value)
            })
        })
        .with_keyed_concurrency(limiter, |key| key.clone());

        // Run 5 effects for key "a" and 5 for key "b"
        let futures_a: Vec<_> = (0..5).map(|_| effect.clone().run("a".to_string())).collect();
        let futures_b: Vec<_> = (0..5).map(|_| effect.clone().run("b".to_string())).collect();

        let results_a = futures::future::join_all(futures_a).await;
        let results_b = futures::future::join_all(futures_b).await;

        let success_a = results_a.iter().filter(|r| r.is_ok()).count();
        let success_b = results_b.iter().filter(|r| r.is_ok()).count();

        // Each key should allow 2 concurrent (max_per_key)
        assert_eq!(success_a, 2);
        assert_eq!(success_b, 2);
    }

    #[tokio::test]
    async fn test_adaptive_concurrency() {
        let adaptive = AdaptiveConcurrency::new(5, 1, 10);

        assert_eq!(adaptive.get_limit().await, 5);

        adaptive.increase().await;
        assert_eq!(adaptive.get_limit().await, 6);

        adaptive.decrease().await;
        adaptive.decrease().await;
        assert_eq!(adaptive.get_limit().await, 4);

        // Should not go below min
        for _ in 0..10 {
            adaptive.decrease().await;
        }
        assert_eq!(adaptive.get_limit().await, 1);

        // Should not go above max
        for _ in 0..20 {
            adaptive.increase().await;
        }
        assert_eq!(adaptive.get_limit().await, 10);
    }
}
