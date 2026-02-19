//! # CI/CD Service Trait
//!
//! Trait defining CI/CD service operations.

use crate::error::AppError;
use crate::types::ci_dashboard::*;
use async_trait::async_trait;

/// Result type for CI/CD operations
pub type CiResult<T> = Result<T, AppError>;

/// CI/CD service trait
#[async_trait]
pub trait CiService: Send + Sync {
    /// Get CI dashboard state
    async fn get_dashboard(&self, filters: CiFilters) -> CiResult<CiDashboard>;

    /// Get pipeline details
    async fn get_pipeline(&self, pipeline_id: &str) -> CiResult<Pipeline>;

    /// Get pipeline run details
    async fn get_pipeline_run(&self, run_id: &str) -> CiResult<PipelineRun>;

    /// Get recent failures
    async fn get_recent_failures(&self, limit: usize) -> CiResult<Vec<FailureAnalysis>>;

    /// Analyze failure
    async fn analyze_failure(&self, run_id: &str) -> CiResult<FailureAnalysis>;

    /// Get deployment history
    async fn get_deployment_history(&self, environment: &str, limit: usize) -> CiResult<Vec<Deployment>>;

    /// Get deployment details
    async fn get_deployment(&self, deployment_id: &str) -> CiResult<Deployment>;

    /// Trigger pipeline run
    async fn trigger_pipeline(&self, pipeline_id: &str, trigger: Trigger) -> CiResult<PipelineRun>;

    /// Cancel pipeline run
    async fn cancel_run(&self, run_id: &str) -> CiResult<()>;

    /// Retry failed run
    async fn retry_run(&self, run_id: &str) -> CiResult<PipelineRun>;

    /// Get pipeline logs
    async fn get_run_logs(&self, run_id: &str) -> CiResult<Vec<LogEntry>>;

    /// Get job logs
    async fn get_job_logs(&self, run_id: &str, job_id: &str) -> CiResult<Vec<LogEntry>>;
}
