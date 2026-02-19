use crate::error::{TaskError, Result};
use crate::types::{Task, TaskStatus, TaskPriority};
use chrono::{DateTime, Utc};

impl super::store::MySQLTaskStore {
    pub(crate) fn row_to_task(row: sqlx::mysql::MySqlRow) -> Result<Task> {
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
            0 => TaskPriority::Low,
            1 => TaskPriority::Normal,
            2 => TaskPriority::High,
            3 => TaskPriority::Critical,
            _ => TaskPriority::Normal,
        };

        let created_at: chrono::NaiveDateTime = row.get("created_at");
        let created_at = DateTime::<Utc>::from_naive_utc_and_offset(created_at, Utc);

        let started_at: Option<chrono::NaiveDateTime> = row.get("started_at");
        let started_at = started_at.map(|dt| DateTime::<Utc>::from_naive_utc_and_offset(dt, Utc));

        let completed_at: Option<chrono::NaiveDateTime> = row.get("completed_at");
        let completed_at = completed_at.map(|dt| DateTime::<Utc>::from_naive_utc_and_offset(dt, Utc));

        let scheduled_at: Option<chrono::NaiveDateTime> = row.get("scheduled_at");
        let scheduled_at = scheduled_at.map(|dt| DateTime::<Utc>::from_naive_utc_and_offset(dt, Utc));

        let metadata: String = row.get("metadata");
        let metadata = serde_json::from_str(&metadata).map_err(TaskError::Serialization)?;

        Ok(Task {
            id: row.get("id"),
            name: row.get("name"),
            status,
            priority,
            created_at,
            started_at,
            completed_at,
            error: row.get("error"),
            metadata,
            cron_expression: row.get("cron_expression"),
            scheduled_at,
            retry_count: row.get::<i32, _>("retry_count") as usize,
            max_retries: row.get::<i32, _>("max_retries") as usize,
        })
    }
}
