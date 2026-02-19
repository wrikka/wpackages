//! # CI/CD Pipeline Run Types
//!
//! Types for pipeline executions including runs, stages, jobs, and logs.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use super::pipeline::Trigger;

/// Pipeline run execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PipelineRun {
    pub id: String,
    pub pipeline_id: String,
    pub run_number: u64,
    pub status: RunStatus,
    pub started_at: chrono::DateTime<chrono::Utc>,
    pub completed_at: Option<chrono::DateTime<chrono::Utc>>,
    pub duration_seconds: Option<u64>,
    pub trigger: Trigger,
    pub commit: CommitInfo,
    pub stage_runs: Vec<StageRun>,
    pub variables: HashMap<String, String>,
}

/// Run status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum RunStatus {
    Pending,
    Running,
    Success,
    Failed,
    Cancelled,
    Skipped,
}

/// Commit information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommitInfo {
    pub hash: String,
    pub message: String,
    pub author: String,
    pub branch: String,
}

/// Stage run execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StageRun {
    pub stage_id: String,
    pub status: RunStatus,
    pub started_at: Option<chrono::DateTime<chrono::Utc>>,
    pub completed_at: Option<chrono::DateTime<chrono::Utc>>,
    pub job_runs: Vec<JobRun>,
}

/// Job run execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JobRun {
    pub job_id: String,
    pub status: RunStatus,
    pub started_at: Option<chrono::DateTime<chrono::Utc>>,
    pub completed_at: Option<chrono::DateTime<chrono::Utc>>,
    pub duration_seconds: Option<u64>,
    pub logs: Vec<LogEntry>,
    pub artifacts: Vec<Artifact>,
}

/// Log entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub level: LogLevel,
    pub message: String,
}

/// Log level
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LogLevel {
    Debug,
    Info,
    Warning,
    Error,
}

/// Artifact from job run
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Artifact {
    pub name: String,
    pub path: String,
    pub size_bytes: u64,
    pub download_url: Option<String>,
}
