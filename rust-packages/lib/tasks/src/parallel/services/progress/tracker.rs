//! Progress tracker for parallel operations

use std::sync::{Arc, Mutex};
use std::time::Instant;
use tokio::sync::Notify;

/// Progress information for a parallel operation
#[derive(Debug, Clone)]
pub struct ProgressInfo {
    pub total: usize,
    pub completed: usize,
    pub failed: usize,
    pub percentage: f64,
    pub elapsed_ms: u64,
    pub estimated_remaining_ms: Option<u64>,
}

/// Progress tracker for parallel operations
#[derive(Clone)]
pub struct ProgressTracker {
    total: Arc<Mutex<usize>>,
    completed: Arc<Mutex<usize>>,
    failed: Arc<Mutex<usize>>,
    start_time: Arc<Mutex<Option<Instant>>>,
    notify: Arc<Notify>,
}

impl ProgressTracker {
    /// Create a new progress tracker
    pub fn new(total: usize) -> Self {
        Self {
            total: Arc::new(Mutex::new(total)),
            completed: Arc::new(Mutex::new(0)),
            failed: Arc::new(Mutex::new(0)),
            start_time: Arc::new(Mutex::new(None)),
            notify: Arc::new(Notify::new()),
        }
    }

    /// Start tracking
    pub fn start(&self) {
        let mut start = self.start_time.lock().unwrap();
        if start.is_none() {
            *start = Some(Instant::now());
        }
    }

    /// Increment completed count
    pub fn increment_completed(&self) {
        let mut completed = self.completed.lock().unwrap();
        *completed += 1;
        drop(completed);
        self.notify.notify_one();
    }

    /// Increment failed count
    pub fn increment_failed(&self) {
        let mut failed = self.failed.lock().unwrap();
        *failed += 1;
        drop(failed);
        self.notify.notify_one();
    }

    /// Get current progress
    pub fn progress(&self) -> ProgressInfo {
        let total = *self.total.lock().unwrap();
        let completed = *self.completed.lock().unwrap();
        let failed = *self.failed.lock().unwrap();
        let start_time = *self.start_time.lock().unwrap();

        let percentage = if total > 0 {
            (completed + failed) as f64 / total as f64 * 100.0
        } else {
            0.0
        };

        let elapsed_ms = start_time
            .map(|t| t.elapsed().as_millis() as u64)
            .unwrap_or(0);

        let estimated_remaining_ms = if total > 0 && completed + failed > 0 {
            let avg_time_per_item = elapsed_ms as f64 / (completed + failed) as f64;
            let remaining = total - (completed + failed);
            Some((avg_time_per_item * remaining as f64) as u64)
        } else {
            None
        };

        ProgressInfo {
            total,
            completed,
            failed,
            percentage,
            elapsed_ms,
            estimated_remaining_ms,
        }
    }

    /// Check if operation is complete
    pub fn is_complete(&self) -> bool {
        let total = *self.total.lock().unwrap();
        let completed = *self.completed.lock().unwrap();
        let failed = *self.failed.lock().unwrap();
        completed + failed >= total
    }

    /// Wait for progress update
    pub async fn wait_for_update(&self) {
        self.notify.notified().await;
    }

    /// Get total count
    pub fn total(&self) -> usize {
        *self.total.lock().unwrap()
    }

    /// Get completed count
    pub fn completed(&self) -> usize {
        *self.completed.lock().unwrap()
    }

    /// Get failed count
    pub fn failed(&self) -> usize {
        *self.failed.lock().unwrap()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_progress_tracker() {
        let tracker = ProgressTracker::new(10);
        tracker.start();

        assert_eq!(tracker.total(), 10);
        assert_eq!(tracker.completed(), 0);
        assert_eq!(tracker.failed(), 0);

        tracker.increment_completed();
        tracker.increment_completed();
        tracker.increment_failed();

        assert_eq!(tracker.completed(), 2);
        assert_eq!(tracker.failed(), 1);

        let progress = tracker.progress();
        assert_eq!(progress.total, 10);
        assert_eq!(progress.completed, 2);
        assert_eq!(progress.failed, 1);
        assert!((progress.percentage - 30.0).abs() < 0.01);
    }

    #[test]
    fn test_is_complete() {
        let tracker = ProgressTracker::new(5);
        tracker.start();

        assert!(!tracker.is_complete());

        for _ in 0..5 {
            tracker.increment_completed();
        }

        assert!(tracker.is_complete());
    }
}
