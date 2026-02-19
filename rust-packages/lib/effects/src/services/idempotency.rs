use crate::error::EffectError;
use crate::types::effect::Effect;
use std::collections::HashSet;
use std::sync::Arc;
use tokio::sync::Mutex;
use std::time::{Duration, Instant};

/// Idempotency key store
#[derive(Debug, Default)]
pub struct IdempotencyStore<T> {
    keys: Arc<Mutex<HashSet<String>>>,
    results: Arc<Mutex<std::collections::HashMap<String, (T, Instant)>>>,
    ttl: Duration,
}

impl<T: Clone + Send + 'static> IdempotencyStore<T> {
    pub fn new(ttl: Duration) -> Self {
        let results = Arc::new(Mutex::new(std::collections::HashMap::new()));
        let results_clone = results.clone();
        let ttl_clone = ttl;

        // Cleanup task
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_secs(60));
            loop {
                interval.tick().await;
                let mut store = results_clone.lock().await;
                let now = Instant::now();
                store.retain(|_, (_, created)| now.duration_since(*created) < ttl_clone);
            }
        });

        Self {
            keys: Arc::new(Mutex::new(HashSet::new())),
            results,
            ttl,
        }
    }

    pub async fn contains(&self, key: &str) -> bool {
        let keys = self.keys.lock().await;
        keys.contains(key)
    }

    pub async fn get_result(&self, key: &str) -> Option<T> {
        let results = self.results.lock().await;
        results.get(key).map(|(v, _)| v.clone())
    }

    pub async fn store_result(&self, key: impl Into<String>, value: T) {
        let mut keys = self.keys.lock().await;
        let key = key.into();
        keys.insert(key.clone());
        drop(keys);

        let mut results = self.results.lock().await;
        results.insert(key, (value, Instant::now()));
    }
}

/// Idempotency configuration
pub struct IdempotencyConfig<R> {
    pub store: Arc<IdempotencyStore<IdempotencyResult>>,
    pub key_extractor: Arc<dyn Fn(&R) -> String + Send + Sync>,
}

impl<R> std::fmt::Debug for IdempotencyConfig<R> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("IdempotencyConfig").finish_non_exhaustive()
    }
}

impl<R> Clone for IdempotencyConfig<R> {
    fn clone(&self) -> Self {
        Self {
            store: self.store.clone(),
            key_extractor: self.key_extractor.clone(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct IdempotencyResult {
    pub success: bool,
    pub value: serde_json::Value,
}

/// Idempotency extension trait
pub trait IdempotencyExt<T, E, R> {
    /// Make effect idempotent using key extraction
    fn idempotent(self, config: IdempotencyConfig<R>) -> Effect<T, E, R>;

    /// Simple idempotency with fixed key
    fn with_idempotency_key(self, store: Arc<IdempotencyStore<T>>, key: impl Into<String>) -> Effect<T, E, R>;
}

impl<T, E, R> IdempotencyExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + serde::Serialize + for<'de> serde::Deserialize<'de> + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn idempotent(self, config: IdempotencyConfig<R>) -> Effect<T, E, R> {
        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let store = config.store.clone();
            let key_extractor = config.key_extractor.clone();

            Box::pin(async move {
                let key = key_extractor(&ctx);

                // Check if we've seen this key before
                if store.contains(&key).await {
                    if let Some(result) = store.get_result(&key).await {
                        if result.success {
                            return serde_json::from_value(result.value)
                                .map_err(|e| EffectError::EffectFailed(format!("Deserialization error: {}", e)).into());
                        } else {
                            return Err(EffectError::EffectFailed("Previous attempt failed".to_string()).into());
                        }
                    }
                }

                // Execute effect
                let result = effect.run(ctx).await;

                // Store result
                let idempotency_result = match &result {
                    Ok(val) => IdempotencyResult {
                        success: true,
                        value: serde_json::to_value(val).unwrap_or_default(),
                    },
                    Err(_) => IdempotencyResult {
                        success: false,
                        value: serde_json::Value::Null,
                    },
                };
                store.store_result(key, idempotency_result).await;

                result
            })
        })
    }

    fn with_idempotency_key(self, store: Arc<IdempotencyStore<T>>, key: impl Into<String>) -> Effect<T, E, R> {
        let key = key.into();

        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let store = store.clone();
            let key = key.clone();

            Box::pin(async move {
                // Check if already executed
                if let Some(result) = store.get_result(&key).await {
                    return Ok(result);
                }

                // Execute effect
                let result = effect.run(ctx).await;

                // Store successful result
                if let Ok(ref val) = result {
                    store.store_result(key.clone(), val.clone()).await;
                }

                result
            })
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_idempotency() {
        let store = Arc::new(IdempotencyStore::<i32>::new(Duration::from_secs(60)));
        let counter = Arc::new(Mutex::new(0));
        let counter_clone = counter.clone();

        let effect = Effect::<i32, EffectError, ()>::new(move |_| {
            let counter = counter_clone.clone();
            Box::pin(async move {
                let mut guard = counter.lock().await;
                *guard += 1;
                Ok(*guard)
            })
        })
        .with_idempotency_key(store.clone(), "unique-key");

        // First execution
        let result1 = effect.clone().run(()).await;
        assert_eq!(result1.unwrap(), 1);

        // Second execution with same key should return cached result
        let result2 = effect.clone().run(()).await;
        assert_eq!(result2.unwrap(), 1);

        // Verify effect only executed once
        let guard = counter.lock().await;
        assert_eq!(*guard, 1);
    }
}
