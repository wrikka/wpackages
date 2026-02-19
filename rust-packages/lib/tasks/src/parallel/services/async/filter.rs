//! Async filtering operations (with side effects)

use crate::{Result, ProgressTracker, CancellationToken};

/// Filter items in parallel with progress tracking and cancellation support
pub fn parallel_filter_with_progress<T, F>(
    items: Vec<T>,
    predicate: F,
    tracker: &ProgressTracker,
    token: &CancellationToken,
) -> Result<Vec<T>>
where
    T: Send + Sync,
    F: Fn(&T) -> bool + Send + Sync,
{
    tracker.start();
    
    let results: Vec<T> = items
        .into_par_iter()
        .filter(|item| {
            token.check_cancelled().ok()?;
            let matches = predicate(item);
            tracker.increment_completed();
            Some(matches)
        })
        .collect();
    
    Ok(results)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parallel_filter_with_progress() {
        use crate::ProgressTracker;
        use crate::CancellationToken;
        
        let items = vec![1, 2, 3, 4, 5];
        let tracker = ProgressTracker::new(5);
        let token = CancellationToken::new();
        
        let result = parallel_filter_with_progress(items, |&x| x % 2 == 0, &tracker, &token);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), vec![2, 4]);
        assert_eq!(tracker.completed(), 5);
    }
}
