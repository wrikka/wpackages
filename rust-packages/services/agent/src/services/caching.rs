//! services/caching.rs

use std::collections::HashMap;
use std::hash::Hash;
use std::sync::{Arc, Mutex};

/// A simple, generic, in-memory cache for agent reasoning steps.
#[derive(Clone)]
pub struct ReasoningCache<K, V> {
    store: Arc<Mutex<HashMap<K, V>>>,
}

impl<K, V> ReasoningCache<K, V>
where
    K: Eq + Hash + Clone,
    V: Clone,
{
    /// Creates a new, empty cache.
    pub fn new() -> Self {
        Self {
            store: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Retrieves a value from the cache for a given key.
    pub fn get(&self, key: &K) -> Option<V> {
        let store = self.store.lock().unwrap();
        store.get(key).cloned()
    }

    /// Inserts a value into the cache for a given key.
    pub fn set(&self, key: K, value: V) {
        let mut store = self.store.lock().unwrap();
        store.insert(key, value);
    }
}

impl<K, V> Default for ReasoningCache<K, V>
where
    K: Eq + Hash + Clone,
    V: Clone,
{
    fn default() -> Self {
        Self::new()
    }
}
