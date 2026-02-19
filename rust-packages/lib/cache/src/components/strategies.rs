use std::collections::HashMap;
use std::time::Instant;

pub trait EvictionStrategy<K>: Send + Sync
where
    K: Send + Sync + std::hash::Hash + Eq + Clone + 'static,
{
    fn should_evict(&self, key: &K) -> bool;

    fn on_access(&self, key: K) -> Self;

    fn on_insert(&self, key: K) -> Self;

    fn on_evict(&self, key: K) -> Self;

    fn evict_candidate(&self) -> Option<K>;
}

pub struct LruStrategy<K>
where
    K: std::hash::Hash + Eq + Clone,
{
    access_times: HashMap<K, Instant>,
}

impl<K> LruStrategy<K>
where
    K: std::hash::Hash + Eq + Clone,
{
    pub fn new() -> Self {
        Self {
            access_times: HashMap::new(),
        }
    }
}

impl<K> Default for LruStrategy<K>
where
    K: std::hash::Hash + Eq + Clone,
{
    fn default() -> Self {
        Self::new()
    }
}

impl<K> EvictionStrategy<K> for LruStrategy<K>
where
    K: Send + Sync + std::hash::Hash + Eq + Clone + 'static,
{
    fn should_evict(&self, _key: &K) -> bool {
        false
    }

    fn on_access(&self, key: K) -> Self {
        let mut new_strategy = self.clone();
        new_strategy.access_times.insert(key, Instant::now());
        new_strategy
    }

    fn on_insert(&self, key: K) -> Self {
        let mut new_strategy = self.clone();
        new_strategy.access_times.insert(key, Instant::now());
        new_strategy
    }

    fn on_evict(&self, key: K) -> Self {
        let mut new_strategy = self.clone();
        new_strategy.access_times.remove(&key);
        new_strategy
    }

    fn evict_candidate(&self) -> Option<K> {
        self.access_times
            .iter()
            .min_by_key(|(_, time)| **time)
            .map(|(key, _)| key.clone())
    }
}

impl<K> Clone for LruStrategy<K>
where
    K: std::hash::Hash + Eq + Clone,
{
    fn clone(&self) -> Self {
        Self {
            access_times: self.access_times.clone(),
        }
    }
}

pub struct LfuStrategy<K>
where
    K: std::hash::Hash + Eq + Clone,
{
    access_counts: HashMap<K, usize>,
}

impl<K> LfuStrategy<K>
where
    K: std::hash::Hash + Eq + Clone,
{
    pub fn new() -> Self {
        Self {
            access_counts: HashMap::new(),
        }
    }
}

impl<K> Default for LfuStrategy<K>
where
    K: std::hash::Hash + Eq + Clone,
{
    fn default() -> Self {
        Self::new()
    }
}

impl<K> EvictionStrategy<K> for LfuStrategy<K>
where
    K: Send + Sync + std::hash::Hash + Eq + Clone + 'static,
{
    fn should_evict(&self, _key: &K) -> bool {
        false
    }

    fn on_access(&self, key: K) -> Self {
        let mut new_strategy = self.clone();
        *new_strategy.access_counts.entry(key).or_insert(0) += 1;
        new_strategy
    }

    fn on_insert(&self, key: K) -> Self {
        let mut new_strategy = self.clone();
        new_strategy.access_counts.insert(key, 1);
        new_strategy
    }

    fn on_evict(&self, key: K) -> Self {
        let mut new_strategy = self.clone();
        new_strategy.access_counts.remove(&key);
        new_strategy
    }

    fn evict_candidate(&self) -> Option<K> {
        self.access_counts
            .iter()
            .min_by_key(|(_, count)| *count)
            .map(|(key, _)| key.clone())
    }
}

impl<K> Clone for LfuStrategy<K>
where
    K: std::hash::Hash + Eq + Clone,
{
    fn clone(&self) -> Self {
        Self {
            access_counts: self.access_counts.clone(),
        }
    }
}
