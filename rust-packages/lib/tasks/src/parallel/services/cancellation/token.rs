//! Cancellation token for parallel operations

use std::sync::{Arc, atomic::{AtomicBool, Ordering}};
use tokio::sync::Notify;

/// Cancellation token for parallel operations
#[derive(Clone)]
pub struct CancellationToken {
    cancelled: Arc<AtomicBool>,
    notify: Arc<Notify>,
}

impl CancellationToken {
    /// Create a new cancellation token
    pub fn new() -> Self {
        Self {
            cancelled: Arc::new(AtomicBool::new(false)),
            notify: Arc::new(Notify::new()),
        }
    }

    /// Check if cancellation has been requested
    pub fn is_cancelled(&self) -> bool {
        self.cancelled.load(Ordering::Relaxed)
    }

    /// Request cancellation
    pub fn cancel(&self) {
        self.cancelled.store(true, Ordering::Relaxed);
        self.notify.notify_waiters();
    }

    /// Wait until cancellation is requested
    pub async fn cancelled(&self) {
        if self.is_cancelled() {
            return;
        }
        self.notify.notified().await;
    }

    /// Check if cancelled and return error if so
    pub fn check_cancelled(&self) -> Result<(), crate::ParallelError> {
        if self.is_cancelled() {
            Err(crate::ParallelError::TaskFailed("Operation cancelled".to_string()))
        } else {
            Ok(())
        }
    }
}

impl Default for CancellationToken {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cancellation_token() {
        let token = CancellationToken::new();
        
        assert!(!token.is_cancelled());
        assert!(token.check_cancelled().is_ok());
        
        token.cancel();
        
        assert!(token.is_cancelled());
        assert!(token.check_cancelled().is_err());
    }

    #[tokio::test]
    async fn test_cancelled_wait() {
        let token = CancellationToken::new();
        
        let token_clone = token.clone();
        tokio::spawn(async move {
            tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
            token_clone.cancel();
        });
        
        token.cancelled().await;
        assert!(token.is_cancelled());
    }
}
