//! PostgreSQL implementation of TaskStore

mod store_postgres_tests;

use super::store::TaskStore;
use crate::types::{Task, TaskStatus, TaskResult};
use crate::error::{Result, TaskError};
use chrono::{DateTime, Utc};
use sqlx::{postgres::PgPool, Row};
use std::path::Path;

pub struct PostgresTaskStore {
    pool: PgPool,
}

impl PostgresTaskStore {
    pub async fn new(database_url: &str) -> Result<Self> {
        let pool = PgPool::connect(database_url).await.map_err(TaskError::Database)?;

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
                status VARCHAR(20) NOT NULL,
                priority INTEGER NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                started_at TIMESTAMP WITH TIME ZONE,
                completed_at TIMESTAMP WITH TIME ZONE,
                error TEXT,
                metadata JSONB NOT NULL,
                cron_expression TEXT,
                scheduled_at TIMESTAMP WITH TIME ZONE,
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
                success BOOLEAN NOT NULL,
                output JSONB,
                error TEXT,
                duration_ms BIGINT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
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
impl TaskStore for PostgresTaskStore {
    async fn save_task(&self, task: &Task) -> Result<()> {
        sqlx::query(
            r#"
            INSERT INTO tasks (
                id, name, status, priority, created_at, started_at, completed_at,
                error, metadata, cron_expression, scheduled_at, retry_count, max_retries
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                status = EXCLUDED.status,
                priority = EXCLUDED.priority,
                started_at = EXCLUDED.started_at,
                completed_at = EXCLUDED.completed_at,
                error = EXCLUDED.error,
                metadata = EXCLUDED.metadata,
                cron_expression = EXCLUDED.cron_expression,
                scheduled_at = EXCLUDED.scheduled_at,
                retry_count = EXCLUDED.retry_count,
                max_retries = EXCLUDED.max_retries
            "#,
        )
        .bind(&task.id)
        .bind(&task.name)
        .bind(format!("{:?}", task.status))
        .bind(task.priority as i32)
        .bind(task.created_at)
        .bind(task.started_at)
        .bind(task.completed_at)
        .bind(&task.error)
        .bind(&task.metadata)
        .bind(task.cron_expression.as_deref())
        .bind(task.scheduled_at)
        .bind(task.retry_count as i64)
        .bind(task.max_retries as i64)
        .execute(&self.pool)
        .await
        .map_err(TaskError::Database)?;

        Ok(())
    }

    async fn get_task(&self, task_id: &str) -> Result<Option<Task>> {
        let row = sqlx::query("SELECT * FROM tasks WHERE id = $1")
            .bind(task_id)
            .fetch_optional(&self.pool)
            .await
            .map_err(TaskError::Database)?;

        match row {
            Some(row) => Ok(Some(Self::row_to_task(row)?)),
            None => Ok(None),
        }
    }

    async fn update_task_status(&self, task_id: &str, status: TaskStatus) -> Result<()> {
        sqlx::query("UPDATE tasks SET status = $1 WHERE id = $2")
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
        sqlx::query("DELETE FROM tasks WHERE id = $1")
            .bind(task_id)
            .execute(&self.pool)
            .await
            .map_err(TaskError::Database)?;

        Ok(())
    }

    async fn list_tasks(&self, status: Option<TaskStatus>) -> Result<Vec<Task>> {
        let rows = if let Some(status) = status {
            sqlx::query("SELECT * FROM tasks WHERE status = $1 ORDER BY created_at DESC")
                .bind(format!("{:?}", status))
                .fetch_all(&self.pool)
                .await
                .map_err(TaskError::Database)?
        } else {
            sqlx::query("SELECT * FROM tasks ORDER BY created_at DESC")
                .fetch_all(&self.pool)
                .await
                .map_err(TaskError::Database)?
        };

        rows.into_iter()
            .map(Self::row_to_task)
            .collect()
    }

    async fn save_result(&self, result: &TaskResult) -> Result<()> {
        sqlx::query(
            r#"
            INSERT INTO task_results (
                task_id, success, output, error, duration_ms, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (task_id) DO UPDATE SET
                success = EXCLUDED.success,
                output = EXCLUDED.output,
                error = EXCLUDED.error,
                duration_ms = EXCLUDED.duration_ms
            "#,
        )
        .bind(&result.task_id)
        .bind(result.success)
        .bind(&result.output)
        .bind(&result.error)
        .bind(result.duration_ms as i64)
        .bind(Utc::now())
        .execute(&self.pool)
        .await
        .map_err(TaskError::Database)?;

        Ok(())
    }

    async fn get_result(&self, task_id: &str) -> Result<Option<TaskResult>> {
        let row = sqlx::query("SELECT * FROM task_results WHERE task_id = $1")
            .bind(task_id)
            .fetch_optional(&self.pool)
            .await
            .map_err(TaskError::Database)?;

        match row {
            Some(row) => {
                Ok(Some(TaskResult {
                    task_id: task_id.to_string(),
                    success: row.get("success"),
                    output: row.get("output"),
                    error: row.get("error"),
                    duration_ms: row.get::<i64, _>("duration_ms") as u64,
                }))
            }
            None => Ok(None),
        }
    }

    async fn list_pending_tasks(&self) -> Result<Vec<Task>> {
        let rows = sqlx::query(
            r#"
            SELECT * FROM tasks
            WHERE status = 'Pending'
            ORDER BY priority DESC, created_at ASC
            "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(TaskError::Database)?;

        rows.into_iter()
            .map(Self::row_to_task)
            .collect()
    }

    async fn list_scheduled_tasks(&self, before: DateTime<Utc>) -> Result<Vec<Task>> {
        let rows = sqlx::query(
            r#"
            SELECT * FROM tasks
            WHERE status = 'Pending'
            AND scheduled_at IS NOT NULL
            AND scheduled_at <= $1
            ORDER BY scheduled_at ASC
            "#,
        )
        .bind(before)
        .fetch_all(&self.pool)
        .await
        .map_err(TaskError::Database)?;

        rows.into_iter()
            .map(Self::row_to_task)
            .collect()
    }
}

impl PostgresTaskStore {
    fn row_to_task(row: sqlx::postgres::PgRow) -> Result<Task> {
        let status_str: String = row.get("status");
        let status = match status_str.as_str() {
            "Pending" => TaskStatus::Pending,
            "Running" => TaskStatus::Running,
            "Completed" => TaskStatus::Completed,
            "Failed" => TaskStatus::Failed,
            "Cancelled" => TaskStatus::Cancelled,
            _ => return Err(TaskError::Other(format!("Invalid status: {}", status_str))),
        };

        let priority: i32 = row.get("priority");
        let priority = match priority {
            0 => crate::types::TaskPriority::Low,
            1 => crate::types::TaskPriority::Normal,
            2 => crate::types::TaskPriority::High,
            3 => crate::types::TaskPriority::Critical,
            _ => crate::types::TaskPriority::Normal,
        };

        Ok(Task {
            id: row.get("id"),
            name: row.get("name"),
            status,
            priority,
            created_at: row.get("created_at"),
            started_at: row.get("started_at"),
            completed_at: row.get("completed_at"),
            error: row.get("error"),
            metadata: row.get("metadata"),
            cron_expression: row.get("cron_expression"),
            scheduled_at: row.get("scheduled_at"),
            retry_count: row.get::<i64, _>("retry_count") as usize,
            max_retries: row.get::<i64, _>("max_retries") as usize,
        })
    }
}
