//! Core data structures and types for task management

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// Unique identifier for a task
pub type TaskId = String;

/// Status of a task
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TaskStatus {
    Pending,
    Running,
    Completed,
    Failed,
    Cancelled,
}

/// Priority level for task execution
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum TaskPriority {
    Low = 0,
    Normal = 1,
    High = 2,
    Critical = 3,
}

impl Default for TaskPriority {
    fn default() -> Self {
        TaskPriority::Normal
    }
}

/// A task that can be executed
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: TaskId,
    pub name: String,
    pub status: TaskStatus,
    pub priority: TaskPriority,
    pub created_at: DateTime<Utc>,
    pub started_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub error: Option<String>,
    pub metadata: serde_json::Value,
    pub cron_expression: Option<String>,
    pub scheduled_at: Option<DateTime<Utc>>,
    pub retry_count: usize,
    pub max_retries: usize,
    pub cancellation_token: Option<String>,
    pub hash: Option<String>,
}

impl Task {
    pub fn new(name: impl Into<String>) -> Self {
        let now = Utc::now();
        Task {
            id: uuid::Uuid::new_v4().to_string(),
            name: name.into(),
            status: TaskStatus::Pending,
            priority: TaskPriority::default(),
            created_at: now,
            started_at: None,
            completed_at: None,
            error: None,
            metadata: serde_json::json!({}),
            cron_expression: None,
            scheduled_at: None,
            retry_count: 0,
            max_retries: 0,
            cancellation_token: None,
            hash: None,
        }
    }

    pub fn with_priority(mut self, priority: TaskPriority) -> Self {
        self.priority = priority;
        self
    }

    pub fn with_metadata(mut self, metadata: serde_json::Value) -> Self {
        self.metadata = metadata;
        self
    }

    pub fn with_cron(mut self, cron_expression: impl Into<String>) -> Self {
        let expr = cron_expression.into();
        self.cron_expression = Some(expr.clone());
        self.scheduled_at = Some(Utc::now());
        self
    }

    pub fn with_scheduled_at(mut self, scheduled_at: DateTime<Utc>) -> Self {
        self.scheduled_at = Some(scheduled_at);
        self
    }

    pub fn with_retries(mut self, max_retries: usize) -> Self {
        self.max_retries = max_retries;
        self
    }

    pub fn start(&mut self) {
        self.status = TaskStatus::Running;
        self.started_at = Some(Utc::now());
    }

    pub fn complete(&mut self) {
        self.status = TaskStatus::Completed;
        self.completed_at = Some(Utc::now());
    }

    pub fn fail(&mut self, error: impl Into<String>) {
        self.status = TaskStatus::Failed;
        self.error = Some(error.into());
        self.completed_at = Some(Utc::now());
        self.retry_count += 1;
    }

    pub fn cancel(&mut self) {
        self.status = TaskStatus::Cancelled;
        self.completed_at = Some(Utc::now());
    }

    pub fn can_retry(&self) -> bool {
        self.status == TaskStatus::Failed && self.retry_count < self.max_retries
    }

    pub fn reset_for_retry(&mut self) {
        self.status = TaskStatus::Pending;
        self.started_at = None;
        self.completed_at = None;
        self.error = None;
    }

    pub fn is_scheduled(&self) -> bool {
        self.scheduled_at.is_some() && self.status == TaskStatus::Pending
    }

    pub fn should_run(&self, now: DateTime<Utc>) -> bool {
        if let Some(scheduled_at) = self.scheduled_at {
            now >= scheduled_at && self.status == TaskStatus::Pending
        } else {
            self.status == TaskStatus::Pending
        }
    }
}

/// Result of executing a task
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskResult {
    pub task_id: TaskId,
    pub success: bool,
    pub output: Option<serde_json::Value>,
    pub error: Option<String>,
    pub duration_ms: u64,
}

impl TaskResult {
    pub fn success(task_id: TaskId, output: serde_json::Value, duration_ms: u64) -> Self {
        TaskResult {
            task_id,
            success: true,
            output: Some(output),
            error: None,
            duration_ms,
        }
    }

    pub fn failure(task_id: TaskId, error: impl Into<String>, duration_ms: u64) -> Self {
        TaskResult {
            task_id,
            success: false,
            output: None,
            error: Some(error.into()),
            duration_ms,
        }
    }
}
