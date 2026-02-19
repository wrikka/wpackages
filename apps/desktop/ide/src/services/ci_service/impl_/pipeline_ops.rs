use crate::error::AppError;
use crate::types::ci_dashboard::*;
use crate::services::ci_service::impl_::CiServiceImpl;

pub trait PipelineOps {
    /// Get pipeline details
    async fn get_pipeline_details(&self, pipeline_id: &str) -> Result<Pipeline, AppError>;

    /// Trigger a pipeline run
    async fn trigger_pipeline_run(&self, pipeline_id: &str, trigger: Trigger) -> Result<PipelineRun, AppError>;
}

impl PipelineOps for CiServiceImpl {
    async fn get_pipeline_details(&self, pipeline_id: &str) -> Result<Pipeline, AppError> {
        tracing::debug!("Getting pipeline {}", pipeline_id);

        Ok(Pipeline {
            id: pipeline_id.to_string(),
            name: "CI Pipeline".to_string(),
            repository: "repo".to_string(),
            stages: vec![],
            triggers: vec![],
            status: PipelineStatus::Active,
            last_run: None,
        })
    }

    async fn trigger_pipeline_run(&self, pipeline_id: &str, trigger: Trigger) -> Result<PipelineRun, AppError> {
        tracing::debug!("Triggering pipeline {} with {:?}", pipeline_id, trigger);

        Ok(PipelineRun {
            id: uuid::Uuid::new_v4().to_string(),
            pipeline_id: pipeline_id.to_string(),
            run_number: 1,
            status: RunStatus::Pending,
            started_at: chrono::Utc::now(),
            completed_at: None,
            duration_seconds: None,
            trigger,
            commit: CommitInfo {
                hash: "abc123".to_string(),
                message: "Triggered run".to_string(),
                author: "developer".to_string(),
                branch: "main".to_string(),
            },
            stage_runs: vec![],
            variables: std::collections::HashMap::new(),
        })
    }
}
