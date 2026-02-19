//! Helper functions for SQLite store

use crate::error::{Result, TaskError};
use crate::types::{Task, TaskPriority, TaskStatus};
use chrono::{DateTime, Utc};
use sqlx::sqlite::SqliteRow;

pub fn row_to_task(row: SqliteRow) -> Result<Task> {
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

    let created_at: String = row.get("created_at");
    let created_at = DateTime::parse_from_rfc3339(&created_at)
        .map_err(|e| TaskError::Other(format!("Invalid created_at: {}", e)))?
        .with_timezone(&Utc);

    let started_at: Option<String> = row.get("started_at");
    let started_at = started_at
        .map(|s| {
            DateTime::parse_from_rfc3339(&s)
                .map_err(|e| TaskError::Other(format!("Invalid started_at: {}", e)))
        })
        .transpose()?
        .map(|d| d.with_timezone(&Utc));

    let completed_at: Option<String> = row.get("completed_at");
    let completed_at = completed_at
        .map(|s| {
            DateTime::parse_from_rfc3339(&s)
                .map_err(|e| TaskError::Other(format!("Invalid completed_at: {}", e)))
        })
        .transpose()?
        .map(|d| d.with_timezone(&Utc));

    let scheduled_at: Option<String> = row.get("scheduled_at");
    let scheduled_at = scheduled_at
        .map(|s| {
            DateTime::parse_from_rfc3339(&s)
                .map_err(|e| TaskError::Other(format!("Invalid scheduled_at: {}", e)))
        })
        .transpose()?
        .map(|d| d.with_timezone(&Utc));

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
        retry_count: row.get("retry_count"),
        max_retries: row.get("max_retries"),
    })
}
