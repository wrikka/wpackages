//! SQLite-based persistence implementation

use crate::error::{QueueError, Result};
use crate::persistence::migrations::run_migrations;
use crate::persistence::Persistence;
use crate::types::{Task, TaskId, TaskPriority, TaskStatus};
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{query, query_as, query_scalar, SqlitePool};
use std::path::Path;

/// SQLite-based persistence implementation
pub struct SQLitePersistence {
    pool: SqlitePool,
}

impl SQLitePersistence {
    /// Create a new SQLite persistence with in-memory database
    pub async fn in_memory() -> Result<Self> {
        let pool = SqlitePool::connect("sqlite::memory:").await.map_err(|e| {
            QueueError::Other(anyhow::anyhow!("Failed to open in-memory database: {}", e))
        })?;

        run_migrations(&pool)
            .await
            .map_err(|e| QueueError::Other(anyhow::anyhow!("Failed to run migrations: {}", e)))?;

        Ok(Self { pool })
    }

    /// Create a new SQLite persistence with file-based database
    pub async fn from_path<P: AsRef<Path>>(path: P) -> Result<Self> {
        let db_path = path.as_ref().to_string_lossy().to_string();
        let pool = SqlitePool::connect(&format!("sqlite:{}", db_path))
            .await
            .map_err(|e| QueueError::Other(anyhow::anyhow!("Failed to open database: {}", e)))?;

        run_migrations(&pool)
            .await
            .map_err(|e| QueueError::Other(anyhow::anyhow!("Failed to run migrations: {}", e)))?;

        Ok(Self { pool })
    }
}

#[async_trait]
impl Persistence for SQLitePersistence {
    async fn save_task(&self, task: &Task) -> Result<()> {
        let payload = serde_json::to_string(task).map_err(QueueError::Serialization)?;

        query(
            "INSERT OR REPLACE INTO tasks (
                id, name, priority, status, payload, created_at, started_at, completed_at,
                scheduled_at, retry_count, max_retries
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        )
        .bind(task.id.to_string())
        .bind(&task.name)
        .bind(task.priority as i32)
        .bind(task.status as i32)
        .bind(&payload)
        .bind(task.created_at.timestamp())
        .bind(task.started_at.map(|t| t.timestamp()))
        .bind(task.completed_at.map(|t| t.timestamp()))
        .bind(None::<i64>)
        .bind(0i32)
        .bind(3i32)
        .execute(&self.pool)
        .await
        .map_err(|e| QueueError::Other(anyhow::anyhow!("Failed to save task: {}", e)))?;

        Ok(())
    }

    async fn get_task(&self, task_id: &TaskId) -> Result<Option<Task>> {
        let result = query_scalar::<_, String>("SELECT payload FROM tasks WHERE id = ?1")
            .bind(task_id.to_string())
            .fetch_optional(&self.pool)
            .await
            .map_err(|e| QueueError::Other(anyhow::anyhow!("Failed to get task: {}", e)))?;

        match result {
            Some(payload) => {
                let task: Task = serde_json::from_str(&payload)
                    .map_err(QueueError::Serialization)?;
                Ok(Some(task))
            }
            None => Ok(None),
        }
    }

    async fn update_task_status(&self, task_id: &TaskId, status: TaskStatus) -> Result<()> {
        query("UPDATE tasks SET status = ?1 WHERE id = ?2")
            .bind(status as i32)
            .bind(task_id.to_string())
            .execute(&self.pool)
            .await
            .map_err(|e| QueueError::Other(anyhow::anyhow!("Failed to update task status: {}", e)))?;

        Ok(())
    }

    async fn update_task_result(
        &self,
        task_id: &TaskId,
        result: &str,
        error: Option<&str>,
    ) -> Result<()> {
        query("UPDATE tasks SET result = ?1, error = ?2, completed_at = ?3 WHERE id = ?4")
            .bind(result)
            .bind(error)
            .bind(Utc::now().timestamp())
            .bind(task_id.to_string())
            .execute(&self.pool)
            .await
            .map_err(|e| QueueError::Other(anyhow::anyhow!("Failed to update task result: {}", e)))?;

        Ok(())
    }

    async fn increment_retry(&self, task_id: &TaskId, next_retry_at: DateTime<Utc>) -> Result<()> {
        query(
            "UPDATE tasks SET retry_count = retry_count + 1, next_retry_at = ?1, status = ?2 WHERE id = ?3",
        )
        .bind(next_retry_at.timestamp())
        .bind(TaskStatus::Pending as i32)
        .bind(task_id.to_string())
        .execute(&self.pool)
        .await
        .map_err(|e| QueueError::Other(anyhow::anyhow!("Failed to increment retry: {}", e)))?;

        Ok(())
    }

    async fn get_pending_tasks(&self, limit: usize) -> Result<Vec<Task>> {
        let tasks = query_as::<_, (String,)>(
            "SELECT payload FROM tasks 
             WHERE status = ?1 
             ORDER BY priority DESC, created_at ASC 
             LIMIT ?2",
        )
        .bind(TaskStatus::Pending as i32)
        .bind(limit as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| QueueError::Other(anyhow::anyhow!("Failed to query tasks: {}", e)))?;

        let result: Result<Vec<_>> = tasks
            .into_iter()
            .map(|(payload,)| {
                serde_json::from_str(&payload).map_err(QueueError::Serialization)
            })
            .collect();

        result
    }

    async fn get_scheduled_tasks(&self, before: DateTime<Utc>, limit: usize) -> Result<Vec<Task>> {
        let tasks = query_as::<_, (String,)>(
            "SELECT payload FROM tasks 
             WHERE status = ?1 AND scheduled_at <= ?2 
             ORDER BY scheduled_at ASC, priority DESC 
             LIMIT ?3",
        )
        .bind(TaskStatus::Pending as i32)
        .bind(before.timestamp())
        .bind(limit as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| QueueError::Other(anyhow::anyhow!("Failed to query tasks: {}", e)))?;

        let result: Result<Vec<_>> = tasks
            .into_iter()
            .map(|(payload,)| {
                serde_json::from_str(&payload).map_err(QueueError::Serialization)
            })
            .collect();

        result
    }

    async fn get_retry_tasks(&self, before: DateTime<Utc>, limit: usize) -> Result<Vec<Task>> {
        let tasks = query_as::<_, (String,)>(
            "SELECT payload FROM tasks 
             WHERE status = ?1 AND next_retry_at <= ?2 
             ORDER BY next_retry_at ASC 
             LIMIT ?3",
        )
        .bind(TaskStatus::Pending as i32)
        .bind(before.timestamp())
        .bind(limit as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| QueueError::Other(anyhow::anyhow!("Failed to query tasks: {}", e)))?;

        let result: Result<Vec<_>> = tasks
            .into_iter()
            .map(|(payload,)| {
                serde_json::from_str(&payload).map_err(QueueError::Serialization)
            })
            .collect();

        result
    }

    async fn delete_task(&self, task_id: &TaskId) -> Result<()> {
        query("DELETE FROM tasks WHERE id = ?1")
            .bind(task_id.to_string())
            .execute(&self.pool)
            .await
            .map_err(|e| QueueError::Other(anyhow::anyhow!("Failed to delete task: {}", e)))?;

        Ok(())
    }

    async fn clear_all(&self) -> Result<()> {
        let mut tx = self.pool.begin().await.map_err(|e| {
            QueueError::Other(anyhow::anyhow!("Failed to begin transaction: {}", e))
        })?;

        query("DELETE FROM tasks")
            .execute(&mut *tx)
            .await
            .map_err(|e| QueueError::Other(anyhow::anyhow!("Failed to clear tasks: {}", e)))?;

        tx.commit()
            .await
            .map_err(|e| QueueError::Other(anyhow::anyhow!("Failed to commit transaction: {}", e)))?;

        Ok(())
    }

    async fn count_by_status(&self, status: TaskStatus) -> Result<usize> {
        let count = query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM tasks WHERE status = ?1",
        )
        .bind(status.to_string())
        .fetch_one(&self.pool)
        .await
        .map_err(|e| QueueError::Other(anyhow::anyhow!("Failed to count tasks: {}", e)))?
        .unwrap_or(0);

        Ok(count as usize)
    }

    async fn total_count(&self) -> Result<usize> {
        let count = query_scalar::<_, i64>("SELECT COUNT(*) FROM tasks")
            .fetch_one(&self.pool)
            .await
            .map_err(|e| QueueError::Other(anyhow::anyhow!("Failed to count tasks: {}", e)))?
            .unwrap_or(0);

        Ok(count as usize)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_sqlite_persistence_save_and_get() {
        let persistence = SQLitePersistence::in_memory().await.unwrap();
        let task = Task::new("test task");

        persistence.save_task(&task).await.unwrap();
        let retrieved = persistence.get_task(&task.id).await.unwrap();

        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().name, "test task");
    }

    #[tokio::test]
    async fn test_sqlite_persistence_count() {
        let persistence = SQLitePersistence::in_memory().await.unwrap();

        assert_eq!(persistence.total_count().await.unwrap(), 0);

        persistence.save_task(&Task::new("task1")).await.unwrap();
        persistence.save_task(&Task::new("task2")).await.unwrap();

        assert_eq!(persistence.total_count().await.unwrap(), 2);
    }
}
