//! # CI/CD Pipeline Types
//!
//! Types for pipeline definitions including stages, jobs, and triggers.

use serde::{Deserialize, Serialize};

/// Pipeline definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Pipeline {
    pub id: String,
    pub name: String,
    pub repository: String,
    pub stages: Vec<Stage>,
    pub triggers: Vec<Trigger>,
    pub status: PipelineStatus,
    pub last_run: Option<chrono::DateTime<chrono::Utc>>,
}

/// Pipeline status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum PipelineStatus {
    Active,
    Paused,
    Disabled,
}

/// Pipeline stage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Stage {
    pub id: String,
    pub name: String,
    pub jobs: Vec<Job>,
    pub dependencies: Vec<String>,
    pub condition: Option<String>,
}

/// Job in a pipeline
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Job {
    pub id: String,
    pub name: String,
    pub steps: Vec<Step>,
    pub timeout_minutes: Option<u32>,
    pub retry_policy: Option<RetryPolicy>,
}

/// Job step
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Step {
    pub id: String,
    pub name: String,
    pub command: String,
    pub on_failure: Option<String>,
}

/// Retry policy
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetryPolicy {
    pub max_attempts: u32,
    pub backoff_seconds: u32,
}

/// Pipeline trigger
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Trigger {
    Push { branch: String },
    PullRequest,
    Tag,
    Schedule { cron: String },
    Manual,
}
