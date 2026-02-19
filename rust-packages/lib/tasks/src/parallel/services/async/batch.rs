//! Async batch processing operations (with side effects)

use tokio::task;
use crate::Result;

/// Process items in batches asynchronously
pub async fn batch_process_async<T, R, F>(
    items: Vec<T>,
    batch_size: usize,
    processor: F,
) -> Result<Vec<R>>
where
    T: Send + Sync + Clone,
    R: Send + Sync,
    F: Fn(Vec<T>) -> task::JoinHandle<Vec<R>> + Send + Sync + Clone,
{
    let batches: Vec<_> = items
        .chunks(batch_size)
        .map(|batch| batch.to_vec())
        .collect();

    let handles: Vec<_> = batches.into_iter().map(processor).collect();

    let mut results = Vec::new();
    for handle in handles {
        results.extend(handle.await?);
    }

    Ok(results)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_batch_process_async() {
        let items = vec![1, 2, 3, 4, 5, 6];
        let result = batch_process_async(items, 2, |batch| {
            tokio::task::spawn(async move { batch.into_iter().map(|x| x * 2).collect() })
        }).await;
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), vec![2, 4, 6, 8, 10, 12]);
    }
}
