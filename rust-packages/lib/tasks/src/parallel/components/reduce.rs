//! Parallel reduction operations

use rayon::prelude::*;
use std::collections::HashMap;

/// Reduce items in parallel
pub fn parallel_reduce<T, R, F, G>(items: Vec<T>, initial: R, mapper: F, reducer: G) -> R
where
    T: Send + Sync,
    R: Send + Sync + Clone,
    F: Fn(T) -> R + Send + Sync,
    G: Fn(R, R) -> R + Send + Sync,
{
    items.into_par_iter()
        .map(mapper)
        .reduce(|| initial.clone(), reducer)
}

/// Sum values in parallel
pub fn parallel_sum<T, F>(items: Vec<T>, mapper: F) -> f64
where
    T: Send + Sync,
    F: Fn(&T) -> f64 + Send + Sync,
{
    items.par_iter().map(mapper).sum()
}

/// Calculate average in parallel
pub fn parallel_average<T, F>(items: Vec<T>, mapper: F) -> f64
where
    T: Send + Sync,
    F: Fn(&T) -> f64 + Send + Sync,
{
    let sum: f64 = items.par_iter().map(&mapper).sum();
    let count = items.len() as f64;

    if count == 0.0 {
        0.0
    } else {
        sum / count
    }
}

/// Find minimum value in parallel
pub fn parallel_min<T, F>(items: Vec<T>, mapper: F) -> Option<f64>
where
    T: Send + Sync,
    F: Fn(&T) -> f64 + Send + Sync,
{
    items.par_iter().map(&mapper).min_by(|a, b| a.partial_cmp(b).unwrap())
}

/// Find maximum value in parallel
pub fn parallel_max<T, F>(items: Vec<T>, mapper: F) -> Option<f64>
where
    T: Send + Sync,
    F: Fn(&T) -> f64 + Send + Sync,
{
    items.par_iter().map(&mapper).max_by(|a, b| a.partial_cmp(b).unwrap())
}

/// Group items by key in parallel
pub fn parallel_group_by<T, K, F>(items: Vec<T>, key_selector: F) -> HashMap<String, Vec<T>>
where
    T: Send + Sync,
    K: std::fmt::Display + Send + Sync,
    F: Fn(&T) -> K + Send + Sync,
{
    items.into_par_iter().fold(
        || HashMap::new(),
        |mut acc, item| {
            let key = key_selector(&item).to_string();
            acc.entry(key).or_insert_with(Vec::new).push(item);
            acc
        },
    ).reduce(
        || HashMap::new(),
        |mut acc1, acc2| {
            for (key, mut value) in acc2 {
                acc1.entry(key).or_insert_with(Vec::new).append(&mut value);
            }
            acc1
        },
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parallel_reduce() {
        let items = vec![1, 2, 3, 4, 5];
        let result = parallel_reduce(items, 0, |x| x, |a, b| a + b);
        assert_eq!(result, 15);
    }

    #[test]
    fn test_parallel_sum() {
        let items = vec![1.0, 2.0, 3.0, 4.0, 5.0];
        let sum = parallel_sum(items, |&x| x);
        assert_eq!(sum, 15.0);
    }

    #[test]
    fn test_parallel_average() {
        let items = vec![1.0, 2.0, 3.0, 4.0, 5.0];
        let avg = parallel_average(items, |&x| x);
        assert_eq!(avg, 3.0);
    }

    #[test]
    fn test_parallel_min() {
        let items = vec![1.0, 2.0, 3.0, 4.0, 5.0];
        let min = parallel_min(items, |&x| x);
        assert_eq!(min, Some(1.0));
    }

    #[test]
    fn test_parallel_max() {
        let items = vec![1.0, 2.0, 3.0, 4.0, 5.0];
        let max = parallel_max(items, |&x| x);
        assert_eq!(max, Some(5.0));
    }

    #[test]
    fn test_parallel_group_by() {
        let items = vec!["apple", "banana", "apricot", "blueberry"];
        let grouped = parallel_group_by(items, |s| &s[0..1]);
        assert_eq!(grouped.get("a").unwrap().len(), 2);
        assert_eq!(grouped.get("b").unwrap().len(), 2);
    }
}
