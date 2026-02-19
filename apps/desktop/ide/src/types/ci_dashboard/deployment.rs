//! # CI/CD Deployment Types
//!
//! Types for deployment tracking and rollback information.

use serde::{Deserialize, Serialize};

/// Deployment information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Deployment {
    pub id: String,
    pub environment: String,
    pub version: String,
    pub status: DeploymentStatus,
    pub deployed_at: chrono::DateTime<chrono::Utc>,
    pub deployed_by: String,
    pub pipeline_run_id: String,
    pub rollback_info: Option<RollbackInfo>,
}

/// Deployment status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum DeploymentStatus {
    InProgress,
    Success,
    Failed,
    RolledBack,
}

/// Rollback information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RollbackInfo {
    pub previous_version: String,
    pub rollback_reason: String,
    pub rolled_back_at: chrono::DateTime<chrono::Utc>,
}
