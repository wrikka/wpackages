use crate::error::AppError;
use crate::types::ci_dashboard::*;
use crate::services::ci_service::impl_::CiServiceImpl;

pub trait RunOps {
    /// Get pipeline run details
    async fn get_run_details(&self, run_id: &str) -> Result<PipelineRun, AppError>;

    /// Cancel a pipeline run
    async fn cancel_pipeline_run(&self, run_id: &str) -> Result<(), AppError>;

    /// Retry a pipeline run
    async fn retry_pipeline_run(&self, run_id: &str) -> Result<PipelineRun, AppError>;

    /// Get logs for a pipeline run
    async fn get_pipeline_run_logs(&self, run_id: &str) -> Result<Vec<LogEntry>, AppError>;

    /// Get logs for a specific job in a pipeline run
    async fn get_job_run_logs(&self, run_id: &str, job_id: &str) -> Result<Vec<LogEntry>, AppError>;
}

impl RunOps for CiServiceImpl {
    async fn get_run_details(&self, run_id: &str) -> Result<PipelineRun, AppError> {
        tracing::debug!("Getting pipeline run {}", run_id);

        Ok(PipelineRun {
            id: run_id.to_string(),
            pipeline_id: "pipeline-1".to_string(),
            run_number: 1,
            status: RunStatus::Success,
            started_at: chrono::Utc::now(),
            completed_at: Some(chrono::Utc::now()),
            duration_seconds: Some(300),
            trigger: Trigger::Push {
                branch: "main".to_string(),
            },
            commit: CommitInfo {
                hash: "abc123".to_string(),
                message: "Add feature".to_string(),
                author: "developer".to_string(),
                branch: "main".to_string(),
            },
            stage_runs: vec![],
            variables: std::collections::HashMap::new(),
        })
    }

    async fn cancel_pipeline_run(&self, run_id: &str) -> Result<(), AppError> {
        tracing::debug!("Cancelling run {}", run_id);
        Ok(())
    }

    async fn retry_pipeline_run(&self, run_id: &str) -> Result<PipelineRun, AppError> {
        tracing::debug!("Retrying run {}", run_id);
        self.get_run_details(run_id).await
    }

    async fn get_pipeline_run_logs(&self, run_id: &str) -> Result<Vec<LogEntry>, AppError> {
        tracing::debug!("Getting logs for run {}", run_id);
        Ok(vec![])
    }

    async fn get_job_run_logs(&self, run_id: &str, job_id: &str) -> Result<Vec<LogEntry>, AppError> {
        tracing::debug!("Getting logs for job {} in run {}", job_id, run_id);
        Ok(vec![])
    }
}
