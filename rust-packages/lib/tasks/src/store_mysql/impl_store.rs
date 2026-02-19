use super::store::MySQLTaskStore;
use super::conversions::row_to_task;
use super::store::MySQLTaskStore;
use crate::error::TaskError;
use crate::types::{Task, TaskStatus, TaskResult};
use chrono::Utc;

#[async_trait::async_trait]
impl crate::store::TaskStore for MySQLTaskStore {
    async fn save_task(&self, task: &Task) -> crate::error::Result<()> {
        let metadata = serde_json::to_string(&task.metadata).map_err(TaskError::Serialization)?;

        sqlx::query(
            r#"
            INSERT INTO tasks (
                id, name, status, priority, created_at, started_at, completed_at,
                error, metadata, cron_expression, scheduled_at, retry_count, max_retries
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                status = VALUES(status),
                priority = VALUES(priority),
                started_at = VALUES(started_at),
                completed_at = VALUES(completed_at),
                error = VALUES(error),
                metadata = VALUES(metadata),
                cron_expression = VALUES(cron_expression),
                scheduled_at = VALUES(scheduled_at),
                retry_count = VALUES(retry_count),
                max_retries = VALUES(max_retries)
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
        .bind(&metadata)
        .bind(task.cron_expression.as_deref())
        .bind(task.scheduled_at)
        .bind(task.retry_count as i32)
        .bind(task.max_retries as i32)
        .execute(self.pool())
        .await
        .map_err(TaskError::Database)?;

        Ok(())
    }

    async fn get_task(&self, task_id: &str) -> crate::error::Result<Option<Task>> {
        let row = sqlx::query("SELECT * FROM tasks WHERE id = ?")
            .bind(task_id)
            .fetch_optional(self.pool())
            .await
            .map_err(TaskError::Database)?;

        match row {
            Some(row) => Ok(Some(row_to_task(row)?)),
            None => Ok(None),
        }
    }

    async fn update_task_status(&self, task_id: &str, status: TaskStatus) -> crate::error::Result<()> {
        sqlx::query("UPDATE tasks SET status = ? WHERE id = ?")
            .bind(format!("{:?}", status))
            .bind(task_id)
            .execute(self.pool())
            .await
            .map_err(TaskError::Database)?;

        Ok(())
    }

    async fn update_task(&self, task: &Task) -> crate::error::Result<()> {
        self.save_task(task).await
    }

    async fn delete_task(&self, task_id: &str) -> crate::error::Result<()> {
        sqlx::query("DELETE FROM tasks WHERE id = ?")
            .bind(task_id)
            .execute(self.pool())
            .await
            .map_err(TaskError::Database)?;

        Ok(())
    }

    async fn list_tasks(&self, status: Option<TaskStatus>) -> crate::error::Result<Vec<Task>> {
        let rows = if let Some(status) = status {
            sqlx::query("SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC")
                .bind(format!("{:?}", status))
                .fetch_all(self.pool())
                .await
                .map_err(TaskError::Database)?
        } else {
            sqlx::query("SELECT * FROM tasks ORDER BY created_at DESC")
                .fetch_all(self.pool())
                .await
                .map_err(TaskError::Database)?
        };

        rows.into_iter()
            .map(row_to_task)
            .collect()
    }

    async fn save_result(&self, result: &TaskResult) -> crate::error::Result<()> {
        let output = result.output.as_ref()
            .map(|v| serde_json::to_string(v))
            .transpose()
            .map_err(TaskError::Serialization)?;

        sqlx::query(
            r#"
            INSERT INTO task_results (
                task_id, success, output, error, duration_ms, created_at
            ) VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                success = VALUES(success),
                output = VALUES(output),
                error = VALUES(error),
                duration_ms = VALUES(duration_ms)
            "#,
        )
        .bind(&result.task_id)
        .bind(result.success)
        .bind(output)
        .bind(&result.error)
        .bind(result.duration_ms as i64)
        .bind(Utc::now())
        .execute(self.pool())
        .await
        .map_err(TaskError::Database)?;

        Ok(())
    }

    async fn get_result(&self, task_id: &str) -> crate::error::Result<Option<TaskResult>> {
        let row = sqlx::query("SELECT * FROM task_results WHERE task_id = ?")
            .bind(task_id)
            .fetch_optional(self.pool())
            .await
            .map_err(TaskError::Database)?;

        match row {
            Some(row) => {
                let output: Option<String> = row.get("output");
                let output = output
                    .map(|s| serde_json::from_str(&s))
                    .transpose()
                    .map_err(TaskError::Serialization)?;

                Ok(Some(TaskResult {
                    task_id: task_id.to_string(),
                    success: row.get("success"),
                    output,
                    error: row.get("error"),
                    duration_ms: row.get::<i64, _>("duration_ms") as u64,
                }))
            }
            None => Ok(None),
        }
    }

    async fn list_pending_tasks(&self) -> crate::error::Result<Vec<Task>> {
        let rows = sqlx::query(
            r#"
            SELECT * FROM tasks
            WHERE status = 'Pending'
            ORDER BY priority DESC, created_at ASC
            "#,
        )
        .fetch_all(self.pool())
        .await
        .map_err(TaskError::Database)?;

        rows.into_iter()
            .map(row_to_task)
            .collect()
    }

    async fn list_scheduled_tasks(&self, before: chrono::DateTime<Utc>) -> crate::error::Result<Vec<Task>> {
        let rows = sqlx::query(
            r#"
            SELECT * FROM tasks
            WHERE status = 'Pending'
            AND scheduled_at IS NOT NULL
            AND scheduled_at <= ?
            ORDER BY scheduled_at ASC
            "#,
        )
        .bind(before)
        .fetch_all(self.pool())
        .await
        .map_err(TaskError::Database)?;

        rows.into_iter()
            .map(row_to_task)
            .collect()
    }
}
