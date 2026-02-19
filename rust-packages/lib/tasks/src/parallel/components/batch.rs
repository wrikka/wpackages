//! Batch processing operations (pure functions)

/// Process items in batches synchronously
pub fn batch_process<T, R, F>(items: Vec<T>, batch_size: usize, processor: F) -> Vec<R>
where
    T: Send + Sync + Clone,
    R: Send + Sync,
    F: Fn(Vec<T>) -> Vec<R> + Send + Sync,
{
    items
        .chunks(batch_size)
        .flat_map(|batch| processor(batch.to_vec()))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_batch_process() {
        let items = vec![1, 2, 3, 4, 5, 6];
        let result = batch_process(items, 2, |batch| batch.into_iter().map(|x| x * 2).collect());
        assert_eq!(result, vec![2, 4, 6, 8, 10, 12]);
    }
}
