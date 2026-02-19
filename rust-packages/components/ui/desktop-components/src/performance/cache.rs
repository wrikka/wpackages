//! Caching utilities for performance optimization
//! 
//! Provides memoization and caching mechanisms to reduce redundant computations

use std::collections::HashMap;
use std::hash::Hash;
use parking_lot::RwLock;
use std::sync::Arc;

/// Thread-safe cache with automatic eviction
pub struct Cache<K, V> {
    inner: Arc<RwLock<HashMap<K, V>>>,
    max_size: usize,
}

impl<K, V> Cache<K, V>
where
    K: Hash + Eq + Clone,
    V: Clone,
{
    /// Create a new cache with maximum size
    pub fn new(max_size: usize) -> Self {
        Self {
            inner: Arc::new(RwLock::new(HashMap::new())),
            max_size,
        }
    }

    /// Get a value from the cache
    pub fn get(&self, key: &K) -> Option<V> {
        let cache = self.inner.read();
        cache.get(key).cloned()
    }

    /// Insert a value into the cache
    pub fn insert(&self, key: K, value: V) {
        let mut cache = self.inner.write();
        if cache.len() >= self.max_size {
            // Simple eviction: remove first item
            if let Some(key) = cache.keys().next().cloned() {
                cache.remove(&key);
            }
        }
        cache.insert(key, value);
    }

    /// Check if cache contains a key
    pub fn contains_key(&self, key: &K) -> bool {
        let cache = self.inner.read();
        cache.contains_key(key)
    }

    /// Clear the cache
    pub fn clear(&self) {
        let mut cache = self.inner.write();
        cache.clear();
    }

    /// Get cache size
    pub fn len(&self) -> usize {
        let cache = self.inner.read();
        cache.len()
    }
}

impl<K, V> Default for Cache<K, V>
where
    K: Hash + Eq + Clone,
    V: Clone,
{
    fn default() -> Self {
        Self::new(1000)
    }
}

/// Memoization helper for expensive computations
pub fn memoize<F, K, V>(cache: &Cache<K, V>, key: K, compute: F) -> V
where
    K: Hash + Eq + Clone,
    V: Clone,
    F: FnOnce() -> V,
{
    if let Some(value) = cache.get(&key) {
        value
    } else {
        let value = compute();
        cache.insert(key, value.clone());
        value
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cache_basic() {
        let cache = Cache::new(10);
        assert!(cache.get(&1).is_none());
        cache.insert(1, "value".to_string());
        assert_eq!(cache.get(&1), Some("value".to_string()));
    }

    #[test]
    fn test_cache_eviction() {
        let cache = Cache::new(2);
        cache.insert(1, "a".to_string());
        cache.insert(2, "b".to_string());
        cache.insert(3, "c".to_string());
        assert!(cache.len() <= 2);
    }

    #[test]
    fn test_memoize() {
        let cache = Cache::new(10);
        let mut counter = 0;
        let result = memoize(&cache, "key", || {
            counter += 1;
            counter
        });
        assert_eq!(result, 1);
        
        let result2 = memoize(&cache, "key", || {
            counter += 1;
            counter
        });
        assert_eq!(result2, 1); // Should use cached value
    }
}
