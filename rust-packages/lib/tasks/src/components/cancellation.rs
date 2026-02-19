//! Task cancellation support

use crate::error::{Result, TaskError};
use crate::store::TaskStore;
use crate::types::{Task, TaskStatus};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use tokio_util::sync::CancellationToken;
use tracing::{info, warn};

/// Task cancellation manager
pub struct CancellationManager {
    tokens: Arc<RwLock<HashMap<String, CancellationToken>>>,
}

impl CancellationManager {
    /// Create a new cancellation manager
    pub fn new() -> Self {
        Self {
            tokens: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Register a task for cancellation
    pub async fn register_task(&self, task_id: String) -> CancellationToken {
        let token = CancellationToken::new();
        self.tokens
            .write()
            .await
            .insert(task_id.clone(), token.clone());
        info!("Registered cancellation token for task {}", task_id);
        token
    }

    /// Cancel a task
    pub async fn cancel_task(&self, task_id: &str) -> Result<()> {
        let tokens = self.tokens.read().await;
        if let Some(token) = tokens.get(task_id) {
            token.cancel();
            info!("Task {} cancelled", task_id);
            Ok(())
        } else {
            Err(TaskError::Other(format!(
                "Task {} not found or not running",
                task_id
            )))
        }
    }

    /// Check if a task is cancelled
    pub async fn is_cancelled(&self, task_id: &str) -> bool {
        let tokens = self.tokens.read().await;
        if let Some(token) = tokens.get(task_id) {
            token.is_cancelled()
        } else {
            false
        }
    }

    /// Unregister a task
    pub async fn unregister_task(&self, task_id: &str) {
        self.tokens.write().await.remove(task_id);
        info!("Unregistered cancellation token for task {}", task_id);
    }

    /// Get cancellation token for a task
    pub async fn get_token(&self, task_id: &str) -> Option<CancellationToken> {
        let tokens = self.tokens.read().await;
        tokens.get(task_id).cloned()
    }

    /// Cancel all tasks
    pub async fn cancel_all(&self) {
        let tokens = self.tokens.read().await;
        for (task_id, token) in tokens.iter() {
            token.cancel();
            warn!("Task {} cancelled (cancel all)", task_id);
        }
    }

    /// Get count of registered tasks
    pub async fn count(&self) -> usize {
        self.tokens.read().await.len()
    }
}

impl Default for CancellationManager {
    fn default() -> Self {
        Self::new()
    }
}

/// Task cancellation service with store integration
pub struct CancellationService<S: TaskStore> {
    store: S,
    manager: CancellationManager,
}

impl<S: TaskStore> CancellationService<S> {
    /// Create a new cancellation service
    pub fn new(store: S, manager: CancellationManager) -> Self {
        Self { store, manager }
    }

    /// Cancel a task and update its status
    pub async fn cancel(&self, task_id: &str) -> Result<Task> {
        // Cancel the task
        self.manager.cancel_task(task_id).await?;

        // Update task status in store
        let mut task = self
            .store
            .get_task(task_id)
            .await?
            .ok_or_else(|| TaskError::Other(format!("Task {} not found", task_id)))?;

        task.cancel();
        self.store.update_task(&task).await?;

        // Unregister the token
        self.manager.unregister_task(task_id).await;

        Ok(task)
    }

    /// Cancel multiple tasks
    pub async fn cancel_many(&self, task_ids: Vec<String>) -> Result<Vec<Task>> {
        let mut cancelled_tasks = Vec::new();

        for task_id in task_ids {
            match self.cancel(&task_id).await {
                Ok(task) => cancelled_tasks.push(task),
                Err(e) => warn!("Failed to cancel task {}: {}", task_id, e),
            }
        }

        Ok(cancelled_tasks)
    }

    /// Cancel tasks by status
    pub async fn cancel_by_status(&self, status: TaskStatus) -> Result<Vec<Task>> {
        let tasks = self.store.list_tasks(Some(status)).await?;
        let task_ids: Vec<String> = tasks.iter().map(|t| t.id.clone()).collect();
        self.cancel_many(task_ids).await
    }

    /// Get cancellation manager
    pub fn manager(&self) -> &CancellationManager {
        &self.manager
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_cancellation_manager() {
        let manager = CancellationManager::new();
        let task_id = "test-task".to_string();

        // Register task
        let token = manager.register_task(task_id.clone()).await;
        assert_eq!(manager.count().await, 1);
        assert!(!manager.is_cancelled(&task_id).await);

        // Cancel task
        manager.cancel_task(&task_id).await.unwrap();
        assert!(manager.is_cancelled(&task_id).await);

        // Unregister task
        manager.unregister_task(&task_id).await;
        assert_eq!(manager.count().await, 0);
    }

    #[tokio::test]
    async fn test_cancellation_token() {
        let manager = CancellationManager::new();
        let task_id = "test-task-2".to_string();

        let token = manager.register_task(task_id.clone()).await;

        // Spawn a task that checks for cancellation
        let token_clone = token.clone();
        let handle = tokio::spawn(async move {
            tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
            if token_clone.is_cancelled() {
                Ok("Task was cancelled")
            } else {
                Err("Task completed normally")
            }
        });

        // Cancel after a short delay
        tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;
        manager.cancel_task(&task_id).await.unwrap();

        let result = handle.await.unwrap();
        assert_eq!(result.unwrap(), "Task was cancelled");
    }

    #[tokio::test]
    async fn test_cancel_all() {
        let manager = CancellationManager::new();

        // Register multiple tasks
        for i in 0..5 {
            manager.register_task(format!("task-{}", i)).await;
        }

        assert_eq!(manager.count().await, 5);

        // Cancel all
        manager.cancel_all().await;

        // Check all are cancelled
        for i in 0..5 {
            assert!(manager.is_cancelled(&format!("task-{}", i)).await);
        }
    }
}
