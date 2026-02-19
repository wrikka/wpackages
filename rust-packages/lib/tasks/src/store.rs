//! Persistence layer for tasks

use crate::types::{Task, TaskStatus, TaskResult};
use crate::error::Result;
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[async_trait::async_trait]
pub trait TaskStore: Send + Sync {
    async fn save_task(&self, task: &Task) -> Result<()>;
    async fn get_task(&self, task_id: &str) -> Result<Option<Task>>;
    async fn update_task_status(&self, task_id: &str, status: TaskStatus) -> Result<()>;
    async fn update_task(&self, task: &Task) -> Result<()>;
    async fn delete_task(&self, task_id: &str) -> Result<()>;
    async fn list_tasks(&self, status: Option<TaskStatus>) -> Result<Vec<Task>>;
    async fn save_result(&self, result: &TaskResult) -> Result<()>;
    async fn get_result(&self, task_id: &str) -> Result<Option<TaskResult>>;
    async fn list_pending_tasks(&self) -> Result<Vec<Task>>;
    async fn list_scheduled_tasks(&self, before: DateTime<Utc>) -> Result<Vec<Task>>;
}
