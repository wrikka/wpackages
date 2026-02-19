use super::PipelineStatus;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CiStatus {
    pub provider: String,
    pub pipeline_id: String,
    pub pipeline_name: String,
    pub status: PipelineStatus,
    pub commit_id: String,
    pub branch: String,
    pub author: String,
    pub started_at: Option<DateTime<Utc>>,
    pub finished_at: Option<DateTime<Utc>>,
    pub duration_seconds: Option<u64>,
    pub url: String,
    pub stages: Vec<StageStatus>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StageStatus {
    pub name: String,
    pub status: PipelineStatus,
    pub started_at: Option<DateTime<Utc>>,
    pub finished_at: Option<DateTime<Utc>>,
    pub duration_seconds: Option<u64>,
    pub jobs: Vec<JobStatus>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JobStatus {
    pub name: String,
    pub status: PipelineStatus,
    pub started_at: Option<DateTime<Utc>>,
    pub finished_at: Option<DateTime<Utc>>,
    pub duration_seconds: Option<u64>,
    pub url: String,
    pub logs_url: Option<String>,
}

#[async_trait::async_trait]
pub trait CiStatusProvider: Send + Sync {
    async fn get_pipeline_status(&self, commit_id: &str) -> crate::CiCdResult<Vec<CiStatus>>;
    async fn get_latest_pipelines(&self, limit: usize) -> crate::CiCdResult<Vec<CiStatus>>;
    fn provider_name(&self) -> &str;
}
