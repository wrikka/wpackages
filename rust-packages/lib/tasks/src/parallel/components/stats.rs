//! Parallel statistics operations

use rayon::prelude::*;

/// Statistics for a collection of values
#[derive(Debug, Clone)]
pub struct ParallelStats {
    pub count: usize,
    pub sum: f64,
    pub average: f64,
    pub min: f64,
    pub max: f64,
}

/// Calculate statistics in parallel
pub fn parallel_statistics<T, F>(items: Vec<T>, mapper: F) -> ParallelStats
where
    T: Send + Sync,
    F: Fn(&T) -> f64 + Send + Sync,
{
    let values: Vec<f64> = items.par_iter().map(&mapper).collect();

    let count = values.len();
    let sum: f64 = values.iter().sum();
    let average = if count > 0 { sum / count as f64 } else { 0.0 };
    let min = values.iter().cloned().fold(f64::INFINITY, f64::min);
    let max = values.iter().cloned().fold(f64::NEG_INFINITY, f64::max);

    ParallelStats {
        count,
        sum,
        average,
        min: if min == f64::INFINITY { 0.0 } else { min },
        max: if max == f64::NEG_INFINITY { 0.0 } else { max },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parallel_statistics() {
        let items = vec![1.0, 2.0, 3.0, 4.0, 5.0];
        let stats = parallel_statistics(items, |&x| x);
        assert_eq!(stats.count, 5);
        assert_eq!(stats.sum, 15.0);
        assert_eq!(stats.average, 3.0);
        assert_eq!(stats.min, 1.0);
        assert_eq!(stats.max, 5.0);
    }

    #[test]
    fn test_parallel_statistics_empty() {
        let items: Vec<f64> = vec![];
        let stats = parallel_statistics(items, |&x| x);
        assert_eq!(stats.count, 0);
        assert_eq!(stats.sum, 0.0);
        assert_eq!(stats.average, 0.0);
        assert_eq!(stats.min, 0.0);
        assert_eq!(stats.max, 0.0);
    }
}
