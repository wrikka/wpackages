//! # CI/CD Dashboard Types
//!
//! Types for the CI/CD Pipeline Visualization feature including
//! pipeline status, failure analysis, and deployment history.

pub mod deployment;
pub mod failure;
pub mod filter;
pub mod pipeline;
pub mod run;

pub use deployment::{Deployment, DeploymentStatus, RollbackInfo};
pub use failure::{AiFailureInsights, FailureAnalysis, FailureType};
pub use filter::{CiFilters, TimeRange};
pub use pipeline::{Job, Pipeline, PipelineStatus, RetryPolicy, Stage, Step, Trigger};
pub use run::{Artifact, CommitInfo, JobRun, LogEntry, LogLevel, PipelineRun, RunStatus, StageRun};

use serde::{Deserialize, Serialize};

/// CI/CD dashboard state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CiDashboard {
    pub pipelines: Vec<Pipeline>,
    pub active_runs: Vec<PipelineRun>,
    pub recent_failures: Vec<FailureAnalysis>,
    pub deployment_history: Vec<Deployment>,
    pub filters: CiFilters,
}
