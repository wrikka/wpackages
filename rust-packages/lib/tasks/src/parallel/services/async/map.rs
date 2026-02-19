//! Async mapping operations (with side effects)

use tokio::task;
use crate::{Result, ProgressTracker, CancellationToken};

/// Async map with concurrency control
pub async fn async_map_concurrent<T, R, F>(
    items: Vec<T>,
    mapper: F,
    concurrency: usize,
) -> Result<Vec<R>>
where
    T: Send + Sync,
    R: Send + Sync + 'static,
    F: Fn(T) -> task::JoinHandle<R> + Send + Sync + Clone,
{
    use tokio::sync::Semaphore;
    use std::sync::Arc;

    let semaphore = Arc::new(Semaphore::new(concurrency));
    let mut results = Vec::new();

    for item in items {
        let permit = semaphore.clone().acquire_owned().await.map_err(|e| {
            crate::ParallelError::ParallelFailed {
                message: format!("Failed to acquire semaphore permit: {}", e),
                source: anyhow::anyhow!(e),
            }
        })?;
        let handle = mapper(item);

        let result = task::spawn(async move {
            let _permit = permit;
            handle.await
        });

        results.push(result);
    }

    let mut final_results = Vec::new();
    for result in results {
        final_results.push(result.await??);
    }

    Ok(final_results)
}

/// Map items in parallel with progress tracking and cancellation support
pub fn parallel_map_with_progress<T, R, F>(
    items: Vec<T>,
    mapper: F,
    tracker: &ProgressTracker,
    token: &CancellationToken,
) -> Result<Vec<R>>
where
    T: Send + Sync,
    R: Send + Sync,
    F: Fn(T) -> Result<R> + Send + Sync,
{
    tracker.start();
    
    let results: Vec<Result<R>> = items
        .into_par_iter()
        .map(|item| {
            token.check_cancelled()?;
            let result = mapper(item);
            
            if result.is_ok() {
                tracker.increment_completed();
            } else {
                tracker.increment_failed();
            }
            
            result
        })
        .collect();
    
    results.into_iter().collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_async_map_concurrent() {
        let items = vec![1, 2, 3, 4, 5];
        let result = async_map_concurrent(items, |x| {
            tokio::task::spawn(async move { x * 2 })
        }, 2).await;
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), vec![2, 4, 6, 8, 10]);
    }
}
