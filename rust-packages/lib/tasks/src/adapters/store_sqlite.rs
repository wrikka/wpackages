//! SQLite implementation of TaskStore

mod store_sqlite_helpers;

use super::store::TaskStore;
use crate::error::{Result, TaskError};
use crate::types::{Task, TaskResult, TaskStatus};
use chrono::{DateTime, Utc};
use sqlx::{
    sqlite::{SqlitePool, SqlitePoolOptions},
    Row,
};
use std::path::Path;

pub struct SQLiteTaskStore {
    pool: SqlitePool,
}

impl SQLiteTaskStore {
    pub async fn new<P: AsRef<Path>>(db_path: P) -> Result<Self> {
        let db_url = format!("sqlite:{}", db_path.as_ref().display());

        // Configure connection pooling
        let pool_options = SqlitePoolOptions::new()
            .max_connections(5)
            .min_connections(1)
            .acquire_timeout(Duration::from_secs(30))
            .idle_timeout(Duration::from_secs(600))
            .max_lifetime(Duration::from_secs(3600));

        let pool = SqlitePool::connect_with_options(&db_url, pool_options)
            .await
            .map_err(TaskError::Database)?;

        let store = Self { pool };
        store.init().await?;
        Ok(store)
    }

    pub async fn in_memory() -> Result<Self> {
        let pool_options = SqlitePoolOptions::new()
            .max_connections(5)
            .min_connections(1)
            .acquire_timeout(Duration::from_secs(30))
            .idle_timeout(Duration::from_secs(600))
            .max_lifetime(Duration::from_secs(3600));

        let pool = SqlitePool::connect_with_options("sqlite::memory:", pool_options)
            .await
            .map_err(TaskError::Database)?;

        let store = Self { pool };
        store.init().await?;
        Ok(store)
    }

    async fn init(&self) -> Result<()> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                status TEXT NOT NULL,
                priority INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                started_at TEXT,
                completed_at TEXT,
                error TEXT,
                metadata TEXT NOT NULL,
                cron_expression TEXT,
                scheduled_at TEXT,
                retry_count INTEGER DEFAULT 0,
                max_retries INTEGER DEFAULT 0
            )
            "#,
        )
        .execute(&self.pool)
        .await
        .map_err(TaskError::Database)?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS task_results (
                task_id TEXT PRIMARY KEY,
                success INTEGER NOT NULL,
                output TEXT,
                error TEXT,
                duration_ms INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (task_id) REFERENCES tasks(id)
            )
            "#,
        )
        .execute(&self.pool)
        .await
        .map_err(TaskError::Database)?;

        // Create indexes for better query performance
        sqlx::query(
            r#"
            CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
            CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_at ON tasks(scheduled_at) WHERE scheduled_at IS NOT NULL;
            CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
            "#,
        )
        .execute(&self.pool)
        .await
        .map_err(TaskError::Database)?;

        Ok(())
    }
}

#[async_trait::async_trait]
impl TaskStore for SQLiteTaskStore {
    async fn save_task(&self, task: &Task) -> Result<()> {
        let metadata = serde_json::to_string(&task.metadata).map_err(TaskError::Serialization)?;

        sqlx::query(
            r#"
            INSERT OR REPLACE INTO tasks (
                id, name, status, priority, created_at, started_at, completed_at,
                error, metadata, cron_expression, scheduled_at, retry_count, max_retries
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&task.id)
        .bind(&task.name)
        .bind(format!("{:?}", task.status))
        .bind(task.priority as i32)
        .bind(task.created_at.to_rfc3339())
        .bind(task.started_at.map(|d| d.to_rfc3339()))
        .bind(task.completed_at.map(|d| d.to_rfc3339()))
        .bind(&task.error)
        .bind(&metadata)
        .bind(task.cron_expression.as_deref())
        .bind(task.scheduled_at.map(|d| d.to_rfc3339()))
        .bind(task.retry_count)
        .bind(task.max_retries)
        .execute(&self.pool)
        .await
        .map_err(TaskError::Database)?;

        Ok(())
    }

    async fn get_task(&self, task_id: &str) -> Result<Option<Task>> {
        let row = sqlx::query("SELECT * FROM tasks WHERE id = ?")
            .bind(task_id)
            .fetch_optional(&self.pool)
            .await
            .map_err(TaskError::Database)?;

        match row {
            Some(row) => Ok(Some(store_sqlite_helpers::row_to_task(row)?)),
            None => Ok(None),
        }
    }

    async fn update_task_status(&self, task_id: &str, status: TaskStatus) -> Result<()> {
        sqlx::query("UPDATE tasks SET status = ? WHERE id = ?")
            .bind(format!("{:?}", status))
            .bind(task_id)
            .execute(&self.pool)
            .await
            .map_err(TaskError::Database)?;

        Ok(())
    }

    async fn update_task(&self, task: &Task) -> Result<()> {
        self.save_task(task).await
    }

    async fn delete_task(&self, task_id: &str) -> Result<()> {
        sqlx::query("DELETE FROM tasks WHERE id = ?")
            .bind(task_id)
            .execute(&self.pool)
            .await
            .map_err(TaskError::Database)?;

        Ok(())
    }

    async fn list_tasks(&self, status: Option<TaskStatus>) -> Result<Vec<Task>> {
        let rows = if let Some(status) = status {
            sqlx::query("SELECT * FROM tasks WHERE status = ?")
                .bind(format!("{:?}", status))
                .fetch_all(&self.pool)
                .await
                .map_err(TaskError::Database)?
        } else {
            sqlx::query("SELECT * FROM tasks")
                .fetch_all(&self.pool)
                .await
                .map_err(TaskError::Database)?
        };

        rows.into_iter()
            .map(store_sqlite_helpers::row_to_task)
            .collect()
    }

    async fn save_result(&self, result: &TaskResult) -> Result<()> {
        let output = result
            .output
            .as_ref()
            .map(|v| serde_json::to_string(v))
            .transpose()
            .map_err(TaskError::Serialization)?;

        sqlx::query(
            r#"
            INSERT OR REPLACE INTO task_results (
                task_id, success, output, error, duration_ms, created_at
            ) VALUES (?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&result.task_id)
        .bind(result.success as i32)
        .bind(output)
        .bind(&result.error)
        .bind(result.duration_ms as i64)
        .bind(Utc::now().to_rfc3339())
        .execute(&self.pool)
        .await
        .map_err(TaskError::Database)?;

        Ok(())
    }

    async fn get_result(&self, task_id: &str) -> Result<Option<TaskResult>> {
        let row = sqlx::query("SELECT * FROM task_results WHERE task_id = ?")
            .bind(task_id)
            .fetch_optional(&self.pool)
            .await
            .map_err(TaskError::Database)?;

        match row {
            Some(row) => {
                let success: i32 = row.get("success");
                let output: Option<String> = row.get("output");
                let output = output
                    .map(|s| serde_json::from_str(&s))
                    .transpose()
                    .map_err(TaskError::Serialization)?;
                let error: Option<String> = row.get("error");
                let duration_ms: i64 = row.get("duration_ms");

                Ok(Some(TaskResult {
                    task_id: task_id.to_string(),
                    success: success == 1,
                    output,
                    error,
                    duration_ms: duration_ms as u64,
                }))
            }
            None => Ok(None),
        }
    }

    async fn list_pending_tasks(&self) -> Result<Vec<Task>> {
        let rows = sqlx::query("SELECT * FROM tasks WHERE status = 'Pending'")
            .fetch_all(&self.pool)
            .await
            .map_err(TaskError::Database)?;

        rows.into_iter()
            .map(store_sqlite_helpers::row_to_task)
            .collect()
    }

    async fn list_scheduled_tasks(&self, before: DateTime<Utc>) -> Result<Vec<Task>> {
        let rows = sqlx::query(
            r#"
            SELECT * FROM tasks
            WHERE status = 'Pending'
            AND scheduled_at IS NOT NULL
            AND scheduled_at <= ?
            ORDER BY scheduled_at ASC
            "#,
        )
        .bind(before.to_rfc3339())
        .fetch_all(&self.pool)
        .await
        .map_err(TaskError::Database)?;

        rows.into_iter()
            .map(store_sqlite_helpers::row_to_task)
            .collect()
    }
}
