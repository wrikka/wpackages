//! Persistence trait for task queue storage

use crate::error::Result;
use crate::types::{Task, TaskId, TaskPriority, TaskStatus};
use async_trait::async_trait;
use chrono::{DateTime, Utc};

/// Persistence layer for task queue
#[async_trait]
pub trait Persistence: Send + Sync {
    /// Save a task to storage
    async fn save_task(&self, task: &Task) -> Result<()>;

    /// Get a task by ID
    async fn get_task(&self, task_id: &TaskId) -> Result<Option<Task>>;

    /// Update task status
    async fn update_task_status(&self, task_id: &TaskId, status: TaskStatus) -> Result<()>;

    /// Update task with result
    async fn update_task_result(
        &self,
        task_id: &TaskId,
        result: &str,
        error: Option<&str>,
    ) -> Result<()>;

    /// Increment retry count
    async fn increment_retry(&self, task_id: &TaskId, next_retry_at: DateTime<Utc>) -> Result<()>;

    /// Get all pending tasks
    async fn get_pending_tasks(&self, limit: usize) -> Result<Vec<Task>>;

    /// Get scheduled tasks ready to run
    async fn get_scheduled_tasks(&self, before: DateTime<Utc>, limit: usize) -> Result<Vec<Task>>;

    /// Get tasks ready for retry
    async fn get_retry_tasks(&self, before: DateTime<Utc>, limit: usize) -> Result<Vec<Task>>;

    /// Delete a task
    async fn delete_task(&self, task_id: &TaskId) -> Result<()>;

    /// Clear all tasks
    async fn clear_all(&self) -> Result<()>;

    /// Get task count by status
    async fn count_by_status(&self, status: TaskStatus) -> Result<usize>;

    /// Get total task count
    async fn total_count(&self) -> Result<usize>;
}
