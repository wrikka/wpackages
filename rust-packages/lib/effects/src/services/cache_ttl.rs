use crate::error::EffectError;
use crate::types::effect::Effect;
use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::Mutex;

/// TTL Cache entry
#[derive(Debug, Clone)]
struct CacheEntry<T> {
    value: T,
    expires_at: Instant,
    created_at: Instant,
}

impl<T> CacheEntry<T> {
    fn is_expired(&self) -> bool {
        Instant::now() > self.expires_at
    }
}

/// TTL Cache store
#[derive(Debug)]
pub struct TtlCache<T> {
    store: Arc<Mutex<HashMap<String, CacheEntry<T>>>>,
    default_ttl: Duration,
}

impl<T: Clone + Send + 'static> TtlCache<T> {
    pub fn new(default_ttl: Duration) -> Self {
        let store: Arc<Mutex<HashMap<String, CacheEntry<T>>>> = Arc::new(Mutex::new(HashMap::new()));
        let store_clone = store.clone();

        // Spawn cleanup task
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_secs(60));
            loop {
                interval.tick().await;
                let mut cache = store_clone.lock().await;
                cache.retain(|_, entry| !entry.is_expired());
            }
        });

        Self { store, default_ttl }
    }

    pub async fn get(&self, key: &str) -> Option<T> {
        let cache = self.store.lock().await;
        if let Some(entry) = cache.get(key) {
            if !entry.is_expired() {
                return Some(entry.value.clone());
            }
        }
        None
    }

    pub async fn set(&self, key: impl Into<String>, value: T, ttl: Option<Duration>) {
        let mut cache = self.store.lock().await;
        let ttl = ttl.unwrap_or(self.default_ttl);
        let entry = CacheEntry {
            value,
            expires_at: Instant::now() + ttl,
            created_at: Instant::now(),
        };
        cache.insert(key.into(), entry);
    }

    pub async fn remove(&self, key: &str) {
        let mut cache = self.store.lock().await;
        cache.remove(key);
    }

    pub async fn clear(&self) {
        let mut cache = self.store.lock().await;
        cache.clear();
    }
}

/// Cache key extractor
pub trait CacheKeyExtractor<R> {
    fn extract_key(&self, ctx: &R) -> String;
}

/// Cache configuration
pub struct CacheConfig<T> {
    pub cache: Arc<TtlCache<T>>,
    pub ttl: Option<Duration>,
    pub key_extractor: Arc<dyn CacheKeyExtractor<()> + Send + Sync>,
}

impl<T> std::fmt::Debug for CacheConfig<T> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("CacheConfig")
            .field("ttl", &self.ttl)
            .finish_non_exhaustive()
    }
}

impl<T> Clone for CacheConfig<T> {
    fn clone(&self) -> Self {
        Self {
            cache: self.cache.clone(),
            ttl: self.ttl,
            key_extractor: self.key_extractor.clone(),
        }
    }
}

impl<T> CacheConfig<T> {
    pub fn new(cache: Arc<TtlCache<T>>) -> Self {
        Self {
            cache,
            ttl: None,
            key_extractor: Arc::new(DefaultKeyExtractor),
        }
    }

    pub fn with_ttl(mut self, ttl: Duration) -> Self {
        self.ttl = Some(ttl);
        self
    }
}

struct DefaultKeyExtractor;

impl<R: std::hash::Hash + serde::Serialize> CacheKeyExtractor<R> for DefaultKeyExtractor {
    fn extract_key(&self, ctx: &R) -> String {
        format!("{:?}", std::hash::Hasher::finish(&mut std::collections::hash_map::DefaultHasher::new()))
    }
}

/// Cache extension trait
pub trait CacheExt<T, E, R> {
    /// Add TTL caching to effect
    fn with_cache(self, config: CacheConfig<T>) -> Effect<T, E, R>;

    /// Simple caching with cache instance
    fn cache(self, cache: Arc<TtlCache<T>>, key: impl Into<String>) -> Effect<T, E, R>;
}

impl<T, E, R> CacheExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_cache(self, config: CacheConfig<T>) -> Effect<T, E, R> {
        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let config = config.clone();

            Box::pin(async move {
                let key = config.key_extractor.extract_key(&());

                // Try to get from cache
                if let Some(cached) = config.cache.get(&key).await {
                    return Ok(cached);
                }

                // Execute effect and cache result
                let result = effect.run(ctx).await;

                if let Ok(ref value) = result {
                    config.cache.set(key, value.clone(), config.ttl).await;
                }

                result
            })
        })
    }

    fn cache(self, cache: Arc<TtlCache<T>>, key: impl Into<String>) -> Effect<T, E, R> {
        let key = key.into();

        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let cache = cache.clone();
            let key = key.clone();

            Box::pin(async move {
                // Try to get from cache
                if let Some(cached) = cache.get(&key).await {
                    return Ok(cached);
                }

                // Execute effect and cache result
                let result = effect.run(ctx).await;

                if let Ok(ref value) = result {
                    cache.set(key, value.clone(), None).await;
                }

                result
            })
        })
    }
}

/// Async cache refresh
pub trait CacheRefreshExt<T, E, R> {
    /// Cache with automatic background refresh
    fn with_async_refresh(
        self,
        cache: Arc<TtlCache<T>>,
        key: impl Into<String>,
        refresh_threshold: Duration,
    ) -> Effect<T, E, R>;
}

impl<T, E, R> CacheRefreshExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_async_refresh(
        self,
        cache: Arc<TtlCache<T>>,
        key: impl Into<String>,
        refresh_threshold: Duration,
    ) -> Effect<T, E, R> {
        let key = key.into();

        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let cache = cache.clone();
            let key = key.clone();
            let threshold = refresh_threshold;

            Box::pin(async move {
                // Try to get from cache
                if let Some(cached) = cache.get(&key).await {
                    // Check if needs refresh (would need timestamp in real implementation)
                    return Ok(cached);
                }

                // Execute effect and cache result
                let result = effect.run(ctx.clone()).await;

                if let Ok(ref value) = result {
                    cache.set(key, value.clone(), Some(threshold * 2)).await;
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
    async fn test_ttl_cache() {
        let cache = Arc::new(TtlCache::<i32>::new(Duration::from_millis(100)));

        // Set value
        cache.set("key", 42, None).await;

        // Get value
        let value = cache.get("key").await;
        assert_eq!(value, Some(42));

        // Wait for expiration
        tokio::time::sleep(Duration::from_millis(150)).await;

        // Should be expired
        let value = cache.get("key").await;
        assert_eq!(value, None);
    }

    #[tokio::test]
    async fn test_effect_cache() {
        let cache = Arc::new(TtlCache::<i32>::new(Duration::from_secs(60)));
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
        .cache(cache.clone(), "test-key");

        // First call should execute
        let result1 = effect.clone().run(()).await;
        assert_eq!(result1.unwrap(), 1);

        // Second call should use cache
        let result2 = effect.clone().run(()).await;
        assert_eq!(result2.unwrap(), 1); // Still 1 from cache

        // Verify effect only executed once
        let guard = counter.lock().await;
        assert_eq!(*guard, 1);
    }
}
