use std::collections::HashMap;
use std::hash::Hash;
use std::collections::VecDeque;

mod memoization_tests;

/// LRU Cache entry
struct LruEntry<K, V> {
    key: K,
    value: V,
}

/// Memoization cache with LRU eviction
pub struct MemoCache<K, V>
where
    K: Hash + Eq + Clone,
    V: Clone,
{
    cache: HashMap<K, V>,
    access_order: VecDeque<K>,
    max_size: usize,
}

impl<K, V> MemoCache<K, V>
where
    K: Hash + Eq + Clone,
    V: Clone,
{
    pub fn new(max_size: usize) -> Self {
        Self {
            cache: HashMap::new(),
            access_order: VecDeque::with_capacity(max_size),
            max_size,
        }
    }

    pub fn with_capacity(capacity: usize, max_size: usize) -> Self {
        Self {
            cache: HashMap::with_capacity(capacity),
            access_order: VecDeque::with_capacity(max_size),
            max_size,
        }
    }

    pub fn get(&self, key: &K) -> Option<&V> {
        self.cache.get(key)
    }

    /// Get value or compute if not exists (without cloning)
    pub fn get_or_insert_with<F>(&mut self, key: K, compute_fn: F) -> &V
    where
        F: FnOnce() -> V,
    {
        if !self.cache.contains_key(&key) {
            let value = compute_fn();
            self.insert(key.clone(), value);
        }
        self.cache.get(&key).unwrap()
    }

    pub fn get_mut(&mut self, key: &K) -> Option<&mut V> {
        // Mark as recently used
        if self.cache.contains_key(key) {
            self.access_order.retain(|k| k != key);
            self.access_order.push_back(key.clone());
        }
        self.cache.get_mut(key)
    }

    pub fn insert(&mut self, key: K, value: V) -> Option<V> {
        // Remove old entry if exists
        if self.cache.contains_key(&key) {
            self.access_order.retain(|k| k != &key);
        }
        
        // Evict LRU if cache is full
        if self.cache.len() >= self.max_size {
            if let Some(lru_key) = self.access_order.pop_front() {
                self.cache.remove(&lru_key);
            }
        }
        
        // Insert new entry
        self.access_order.push_back(key.clone());
        self.cache.insert(key, value)
    }

    pub fn remove(&mut self, key: &K) -> Option<V> {
        self.access_order.retain(|k| k != key);
        self.cache.remove(key)
    }

    pub fn clear(&mut self) {
        self.cache.clear();
        self.access_order.clear();
    }

    pub fn len(&self) -> usize {
        self.cache.len()
    }

    pub fn is_empty(&self) -> bool {
        self.cache.is_empty()
    }

    pub fn contains_key(&self, key: &K) -> bool {
        self.cache.contains_key(key)
    }
}

impl<K, V> Default for MemoCache<K, V>
where
    K: Hash + Eq + Clone,
    V: Clone,
{
    fn default() -> Self {
        Self::new(100)
    }
}

/// Memoization utility for functions
///
/// Cache function results based on arguments
///
/// # Arguments
/// * `cache` - The memoization cache
/// * `key` - The cache key
/// * `compute_fn` - The function to compute the value if not cached
///
/// # Returns
/// * The cached or computed value
///
/// # Examples
/// ```no_run
/// use rsui::utils::memoization::{memoize, MemoCache};
///
/// let mut cache: MemoCache<String, i32> = MemoCache::new(100);
/// let result = memoize(&mut cache, "key".to_string(), || {
///     expensive_computation()
/// });
/// ```
pub fn memoize<K, V, F>(cache: &mut MemoCache<K, V>, key: K, compute_fn: F) -> V
where
    K: Hash + Eq + Clone,
    V: Clone,
    F: FnOnce() -> V,
{
    if let Some(value) = cache.get(&key) {
        value.clone()
    } else {
        let value = compute_fn();
        cache.insert(key, value.clone());
        value
    }
}

/// Memoization utility without cloning (returns reference)
///
/// Cache function results based on arguments, returns reference to avoid cloning
///
/// # Arguments
/// * `cache` - The memoization cache
/// * `key` - The cache key
/// * `compute_fn` - The function to compute the value if not cached
///
/// # Returns
/// * Reference to the cached or computed value
///
/// # Examples
/// ```no_run
/// use rsui::utils::memoization::{memoize_ref, MemoCache};
///
/// let mut cache: MemoCache<String, i32> = MemoCache::new(100);
/// let result = memoize_ref(&mut cache, "key".to_string(), || {
///     expensive_computation()
/// });
/// ```
pub fn memoize_ref<'a, K, V, F>(cache: &'a mut MemoCache<K, V>, key: K, compute_fn: F) -> &'a V
where
    K: Hash + Eq + Clone,
    V: Clone,
    F: FnOnce() -> V,
{
    cache.get_or_insert_with(key, compute_fn)
}

/// Memoized function wrapper
///
/// Creates a memoized version of a function
///
/// # Arguments
/// * `func` - The function to memoize
///
/// # Returns
/// * A memoized function
///
/// # Examples
/// ```no_run
/// use rsui::utils::memoization::memoize_fn;
///
/// fn expensive_computation(x: i32) -> i32 {
///     x * x
/// }
///
/// let memoized = memoize_fn(expensive_computation);
/// let result1 = memoized(5); // Computes
/// let result2 = memoized(5); // Returns cached value
/// ```
pub fn memoize_fn<K, V, F>(func: F) -> impl Fn(K) -> V
where
    K: Hash + Eq + Clone,
    V: Clone,
    F: Fn(K) -> V,
{
    let mut cache = MemoCache::new(100);
    move |key: K| memoize(&mut cache, key, || func(key.clone()))
}

/// Memoized function with custom cache size
///
/// # Arguments
/// * `func` - The function to memoize
/// * `max_size` - Maximum cache size
///
/// # Returns
/// * A memoized function
///
/// # Examples
/// ```no_run
/// use rsui::utils::memoization::memoize_fn_with_cache;
///
/// fn expensive_computation(x: i32) -> i32 {
///     x * x
/// }
///
/// let memoized = memoize_fn_with_cache(expensive_computation, 50);
/// ```
pub fn memoize_fn_with_cache<K, V, F>(func: F, max_size: usize) -> impl Fn(K) -> V
where
    K: Hash + Eq + Clone,
    V: Clone,
    F: Fn(K) -> V,
{
    let mut cache = MemoCache::with_capacity(max_size, max_size);
    move |key: K| memoize(&mut cache, key, || func(key.clone()))
}

/// Memoized function with multiple arguments
///
/// # Arguments
/// * `func` - The function to memoize
///
/// # Returns
/// * A memoized function
///
/// # Examples
/// ```no_run
/// use rsui::utils::memoization::memoize_fn2;
///
/// fn add(a: i32, b: i32) -> i32 {
///     a + b
/// }
///
/// let memoized = memoize_fn2(add);
/// let result1 = memoized(1, 2); // Computes
/// let result2 = memoized(1, 2); // Returns cached value
/// ```
pub fn memoize_fn2<K1, K2, V, F>(func: F) -> impl Fn(K1, K2) -> V
where
    K1: Hash + Eq + Clone,
    K2: Hash + Eq + Clone,
    V: Clone,
    F: Fn(K1, K2) -> V,
{
    let mut cache = MemoCache::new(100);
    move |key1: K1, key2: K2| memoize(&mut cache, (key1, key2), || func(key1.clone(), key2.clone()))
}

/// Memoized function with three arguments
///
/// # Arguments
/// * `func` - The function to memoize
///
/// # Returns
/// * A memoized function
///
/// # Examples
/// ```no_run
/// use rsui::utils::memoization::memoize_fn3;
///
/// fn multiply(a: i32, b: i32, c: i32) -> i32 {
///     a * b * c
/// }
///
/// let memoized = memoize_fn3(multiply);
/// let result = memoized(2, 3, 4);
/// ```
pub fn memoize_fn3<K1, K2, K3, V, F>(func: F) -> impl Fn(K1, K2, K3) -> V
where
    K1: Hash + Eq + Clone,
    K2: Hash + Eq + Clone,
    K3: Hash + Eq + Clone,
    V: Clone,
    F: Fn(K1, K2, K3) -> V,
{
    let mut cache = MemoCache::new(100);
    move |key1: K1, key2: K2, key3: K3| {
        memoize(&mut cache, (key1, key2, key3), || func(key1.clone(), key2.clone(), key3.clone()))
    }
}

/// Memoized async function placeholder
///
/// Note: This is a placeholder for async memoization.
/// Actual async memoization would require async runtime integration.
///
/// # Arguments
/// * `func` - The async function to memoize
///
/// # Returns
/// * A memoized async function
///
/// # Examples
/// ```no_run
/// use rsui::utils::memoization::memoize_async_fn;
///
/// async fn async_computation(x: i32) -> i32 {
///     x * x
/// }
///
/// let memoized = memoize_async_fn(async_computation);
/// ```
pub fn memoize_async_fn<K, V, F, Fut>(func: F) -> impl Fn(K) -> Fut
where
    K: Hash + Eq + Clone,
    V: Clone,
    F: Fn(K) -> Fut,
    Fut: std::future::Future<Output = V>,
{
    let mut cache = MemoCache::new(100);
    move |key: K| {
        if let Some(value) = cache.get(&key) {
            // Return future that resolves to cached value
            // Note: This is a simplified implementation
            func(key)
        } else {
            func(key)
        }
    }
}
