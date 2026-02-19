//! Parallel mapping operations (pure functions)

use rayon::prelude::*;

/// Map items in parallel using Rayon
pub fn parallel_map<T, R, F>(items: Vec<T>, mapper: F) -> Vec<R>
where
    T: Send + Sync,
    R: Send + Sync,
    F: Fn(T) -> R + Send + Sync,
{
    items.into_par_iter().map(mapper).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parallel_map() {
        let items = vec![1, 2, 3, 4, 5];
        let result = parallel_map(items, |x| x * 2);
        assert_eq!(result, vec![2, 4, 6, 8, 10]);
    }
}
