//! Parallel filtering operations (pure functions)

use rayon::prelude::*;

/// Filter items in parallel
pub fn parallel_filter<T, F>(items: Vec<T>, predicate: F) -> Vec<T>
where
    T: Send + Sync,
    F: Fn(&T) -> bool + Send + Sync,
{
    items.into_par_iter().filter(predicate).collect()
}

/// Partition items in parallel
pub fn parallel_partition<T, F>(items: Vec<T>, predicate: F) -> (Vec<T>, Vec<T>)
where
    T: Send + Sync,
    F: Fn(&T) -> bool + Send + Sync,
{
    items.into_par_iter().partition(predicate)
}

/// Check if any item satisfies the predicate
pub fn parallel_any<T, F>(items: Vec<T>, predicate: F) -> bool
where
    T: Send + Sync,
    F: Fn(&T) -> bool + Send + Sync,
{
    items.par_iter().any(predicate)
}

/// Check if all items satisfy the predicate
pub fn parallel_all<T, F>(items: Vec<T>, predicate: F) -> bool
where
    T: Send + Sync,
    F: Fn(&T) -> bool + Send + Sync,
{
    items.par_iter().all(predicate)
}

/// Find the first item that satisfies the predicate
pub fn parallel_find<T, F>(items: Vec<T>, predicate: F) -> Option<T>
where
    T: Send + Sync,
    F: Fn(&T) -> bool + Send + Sync,
{
    items.into_par_iter().find_first(predicate)
}

/// Count items that satisfy the predicate
pub fn parallel_count<T, F>(items: Vec<T>, predicate: F) -> usize
where
    T: Send + Sync,
    F: Fn(&T) -> bool + Send + Sync,
{
    items.par_iter().filter(|&x| predicate(x)).count()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parallel_filter() {
        let items = vec![1, 2, 3, 4, 5];
        let result = parallel_filter(items, |&x| x % 2 == 0);
        assert_eq!(result, vec![2, 4]);
    }

    #[test]
    fn test_parallel_partition() {
        let items = vec![1, 2, 3, 4, 5];
        let (even, odd) = parallel_partition(items, |&x| x % 2 == 0);
        assert_eq!(even.len(), 2);
        assert_eq!(odd.len(), 3);
    }

    #[test]
    fn test_parallel_any() {
        let items = vec![1, 2, 3, 4, 5];
        assert!(parallel_any(items.clone(), |&x| x == 3));
        assert!(!parallel_any(items, |&x| x == 10));
    }

    #[test]
    fn test_parallel_all() {
        let items = vec![2, 4, 6, 8];
        assert!(parallel_all(items.clone(), |&x| x % 2 == 0));
        assert!(!parallel_all(vec![1, 2, 3], |&x| x % 2 == 0));
    }

    #[test]
    fn test_parallel_find() {
        let items = vec![1, 2, 3, 4, 5];
        let found = parallel_find(items, |&x| x > 3);
        assert_eq!(found, Some(4));
    }

    #[test]
    fn test_parallel_count() {
        let items = vec![1, 2, 3, 4, 5];
        let count = parallel_count(items, |&x| x % 2 == 0);
        assert_eq!(count, 2);
    }
}
