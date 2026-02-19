use crate::error::EffectError;
use crate::types::effect::Effect;
use std::collections::HashMap;
use std::hash::{Hash, Hasher};
use std::sync::Arc;
use tokio::sync::Mutex;
use std::time::{Duration, Instant};

/// Memoization cache entry
#[derive(Debug, Clone)]
struct MemoEntry<T> {
    value: T,
    created_at: Instant,
    access_count: u64,
}

/// Memoization cache
#[derive(Debug)]
pub struct MemoCache<T> {
    store: Arc<Mutex<HashMap<u64, MemoEntry<T>>>>,
    max_size: usize,
    ttl: Option<Duration>,
}

impl<T: Clone + Send + 'static> MemoCache<T> {
    pub fn new(max_size: usize) -> Self {
        Self {
            store: Arc::new(Mutex::new(HashMap::new())),
            max_size,
            ttl: None,
        }
    }

    pub fn with_ttl(mut self, ttl: Duration) -> Self {
        self.ttl = Some(ttl);
        self
    }

    pub async fn get(&self, key: u64) -> Option<T> {
        let mut store = self.store.lock().await;

        if let Some(entry) = store.get(&key) {
            // Check TTL
            if let Some(ttl) = self.ttl {
                if Instant::now().duration_since(entry.created_at) > ttl {
                    store.remove(&key);
                    return None;
                }
            }

            // Update access count
            let mut entry = entry.clone();
            entry.access_count += 1;
            store.insert(key, entry.clone());

            return Some(entry.value);
        }

        None
    }

    pub async fn set(&self, key: u64, value: T) {
        let mut store = self.store.lock().await;

        // Evict if at capacity (LRU eviction)
        if store.len() >= self.max_size {
            let lru_key = store
                .iter()
                .min_by_key(|(_, v)| v.access_count)
                .map(|(k, _)| *k);
            if let Some(k) = lru_key {
                store.remove(&k);
            }
        }

        store.insert(
            key,
            MemoEntry {
                value,
                created_at: Instant::now(),
                access_count: 0,
            },
        );
    }

    pub async fn invalidate(&self, key: u64) {
        let mut store = self.store.lock().await;
        store.remove(&key);
    }

    pub async fn clear(&self) {
        let mut store = self.store.lock().await;
        store.clear();
    }
}

/// Hashable context for memoization
pub trait HashableContext {
    fn hash_key(&self) -> u64;
}

/// Memoization extension trait
pub trait MemoExt<T, E, R> {
    /// Memoize effect by hashing the context
    fn memoize(self, cache: Arc<MemoCache<T>>) -> Effect<T, E, R>
    where
        R: HashableContext;

    /// Memoize with custom key function
    fn memoize_by_key<F>(self, cache: Arc<MemoCache<T>>, key_fn: F) -> Effect<T, E, R>
    where
        F: Fn(&R) -> u64 + Send + Sync + 'static;
}

impl<T, E, R> MemoExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn memoize(self, cache: Arc<MemoCache<T>>) -> Effect<T, E, R>
    where
        R: HashableContext,
    {
        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let cache = cache.clone();

            Box::pin(async move {
                let key = ctx.hash_key();

                // Try to get from cache
                if let Some(cached) = cache.get(key).await {
                    return Ok(cached);
                }

                // Execute and cache
                let result = effect.run(ctx).await;
                if let Ok(ref value) = result {
                    cache.set(key, value.clone()).await;
                }

                result
            })
        })
    }

    fn memoize_by_key<F>(self, cache: Arc<MemoCache<T>>, key_fn: F) -> Effect<T, E, R>
    where
        F: Fn(&R) -> u64 + Send + Sync + 'static,
    {
        let key_fn = Arc::new(Mutex::new(key_fn));

        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let cache = cache.clone();
            let key_fn = key_fn.clone();

            Box::pin(async move {
                let key = {
                    let guard = key_fn.lock().await;
                    guard(&ctx)
                };

                if let Some(cached) = cache.get(key).await {
                    return Ok(cached);
                }

                let result = effect.run(ctx).await;
                if let Ok(ref value) = result {
                    cache.set(key, value.clone()).await;
                }

                result
            })
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    impl HashableContext for i32 {
        fn hash_key(&self) -> u64 {
            *self as u64
        }
    }

    #[tokio::test]
    async fn test_memoization() {
        let cache = Arc::new(MemoCache::<i32>::new(100));
        let counter = Arc::new(Mutex::new(0));
        let counter_clone = counter.clone();

        let effect = Effect::<i32, EffectError, i32>::new(move |ctx: i32| {
            let counter = counter_clone.clone();
            Box::pin(async move {
                let mut guard = counter.lock().await;
                *guard += 1;
                Ok(ctx * 2)
            })
        })
        .memoize(cache.clone());

        // Same context - should use cache
        let r1 = effect.clone().run(5).await;
        let r2 = effect.clone().run(5).await;

        assert_eq!(r1.unwrap(), 10);
        assert_eq!(r2.unwrap(), 10);

        // Should only execute once
        let guard = counter.lock().await;
        assert_eq!(*guard, 1);
    }
}
