//! Database schema for task queue

use crate::types::{TaskId, TaskPriority, TaskStatus};
use chrono::{DateTime, Utc};

/// Database schema version
pub const SCHEMA_VERSION: i32 = 1;

/// SQL schema for tasks table
pub const TASKS_TABLE_SQL: &str = r#"
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    priority INTEGER NOT NULL,
    status INTEGER NOT NULL,
    payload TEXT NOT NULL,
    result TEXT,
    error TEXT,
    created_at INTEGER NOT NULL,
    started_at INTEGER,
    completed_at INTEGER,
    scheduled_at INTEGER,
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    next_retry_at INTEGER,
    dependencies TEXT,
    metadata TEXT
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_scheduled ON tasks(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_tasks_next_retry ON tasks(next_retry_at);
"#;

/// SQL schema for schema_version table
pub const SCHEMA_VERSION_TABLE_SQL: &str = r#"
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at INTEGER NOT NULL
);
"#;

/// SQL schema for queue metadata
pub const QUEUE_METADATA_TABLE_SQL: &str = r#"
CREATE TABLE IF NOT EXISTS queue_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);
"#;

/// Get all SQL statements for schema creation
pub fn get_all_schema_sql() -> Vec<&'static str> {
    vec![
        SCHEMA_VERSION_TABLE_SQL,
        TASKS_TABLE_SQL,
        QUEUE_METADATA_TABLE_SQL,
    ]
}
