#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_memo_cache() {
        let mut cache: MemoCache<String, i32> = MemoCache::new(10);
        
        assert!(cache.is_empty());
        assert_eq!(cache.len(), 0);
        
        cache.insert("key1".to_string(), 42);
        assert_eq!(cache.len(), 1);
        assert_eq!(cache.get("key1"), Some(&42));
        assert!(cache.contains_key("key1"));
        
        cache.remove("key1");
        assert!(!cache.contains_key("key1"));
        
        cache.clear();
        assert!(cache.is_empty());
    }

    #[test]
    fn test_memoize() {
        let mut cache: MemoCache<i32, i32> = MemoCache::new(10);
        let mut call_count = 0;
        
        let result1 = memoize(&mut cache, 5, || {
            call_count += 1;
            42
        });
        
        assert_eq!(result1, 42);
        assert_eq!(call_count, 1);
        
        let result2 = memoize(&mut cache, 5, || {
            call_count += 1;
            100
        });
        
        assert_eq!(result2, 42);
        assert_eq!(call_count, 1); // Should not call again
    }

    #[test]
    fn test_memoize_fn() {
        let mut call_count = 0;
        
        fn expensive(x: i32) -> i32 {
            x * x
        }
        
        let memoized = memoize_fn(move |x: i32| {
            call_count += 1;
            expensive(x)
        });
        
        let result1 = memoized(5);
        assert_eq!(result1, 25);
        assert_eq!(call_count, 1);
        
        let result2 = memoized(5);
        assert_eq!(result2, 25);
        assert_eq!(call_count, 1); // Should not call again
    }

    #[test]
    fn test_memoize_fn2() {
        let mut call_count = 0;
        
        fn add(a: i32, b: i32) -> i32 {
            a + b
        }
        
        let memoized = memoize_fn2(move |a: i32, b: i32| {
            call_count += 1;
            add(a, b)
        });
        
        let result1 = memoized(1, 2);
        assert_eq!(result1, 3);
        assert_eq!(call_count, 1);
        
        let result2 = memoized(1, 2);
        assert_eq!(result2, 3);
        assert_eq!(call_count, 1); // Should not call again
    }

    #[test]
    fn test_memoize_fn3() {
        let mut call_count = 0;
        
        fn multiply(a: i32, b: i32, c: i32) -> i32 {
            a * b * c
        }
        
        let memoized = memoize_fn3(move |a: i32, b: i32, c: i32| {
            call_count += 1;
            multiply(a, b, c)
        });
        
        let result1 = memoized(2, 3, 4);
        assert_eq!(result1, 24);
        assert_eq!(call_count, 1);
        
        let result2 = memoized(2, 3, 4);
        assert_eq!(result2, 24);
        assert_eq!(call_count, 1); // Should not call again
    }

    #[test]
    fn test_cache_eviction() {
        let mut cache: MemoCache<i32, i32> = MemoCache::new(2);
        
        cache.insert(1, 10);
        cache.insert(2, 20);
        assert_eq!(cache.len(), 2);
        
        // Insert third item, should evict LRU (1)
        cache.insert(3, 30);
        assert_eq!(cache.len(), 2);
        assert_eq!(cache.get(&1), None); // Evicted
        assert_eq!(cache.get(&2), Some(&20)); // Still present
        assert_eq!(cache.get(&3), Some(&30)); // New item
    }

    #[test]
    fn test_lru_order() {
        let mut cache: MemoCache<i32, i32> = MemoCache::new(3);
        
        cache.insert(1, 10);
        cache.insert(2, 20);
        cache.insert(3, 30);
        
        // Access 1 to make it MRU
        cache.get(&1);
        
        // Insert 4, should evict LRU (2)
        cache.insert(4, 40);
        assert_eq!(cache.get(&1), Some(&10)); // Still present (accessed)
        assert_eq!(cache.get(&2), None); // Evicted (LRU)
        assert_eq!(cache.get(&3), Some(&30)); // Still present
        assert_eq!(cache.get(&4), Some(&40)); // New item
    }

    #[test]
    fn test_update_existing() {
        let mut cache: MemoCache<i32, i32> = MemoCache::new(2);
        
        cache.insert(1, 10);
        cache.insert(2, 20);
        
        // Update existing key
        cache.insert(1, 100);
        assert_eq!(cache.len(), 2);
        assert_eq!(cache.get(&1), Some(&100));
        
        // Insert third, should evict 2 (LRU)
        cache.insert(3, 30);
        assert_eq!(cache.get(&2), None);
        assert_eq!(cache.get(&3), Some(&30));
    }
}
