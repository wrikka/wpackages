use crate::types::{CiStatus, CiStatusProvider, JobStatus, PipelineStatus, StageStatus};
use crate::CiCdResult;
use crate::adapters::github::models::{GitHubWorkflowRun, GitHubJob};
use crate::utils::github::map_status;
use async_trait::async_trait;
use chrono::{DateTime, Utc};

pub struct GitHubActions {
    token: String,
    owner: String,
    repo: String,
}

impl GitHubActions {
    pub fn new(token: String, owner: String, repo: String) -> Self {
        Self { token, owner, repo }
    }
}

#[async_trait]
impl CiStatusProvider for GitHubActions {
    async fn get_pipeline_status(&self, commit_id: &str) -> CiCdResult<Vec<CiStatus>> {
        let client = reqwest::Client::new();
        let url = format!(
            "https://api.github.com/repos/{}/{}/actions/runs?head_sha={}",
            self.owner, self.repo, commit_id
        );
        
        let response = client
            .get(&url)
            .header("Authorization", format!("Bearer {}", self.token))
            .header("Accept", "application/vnd.github.v3+json")
            .send()
            .await?;
        
        if !response.status().is_success() {
            return Err(crate::CiCdError::Api(format!(
                "GitHub API error: {}",
                response.status()
            )));
        }
        
        let data: serde_json::Value = response.json().await?;
        let runs: Vec<GitHubWorkflowRun> = serde_json::from_value(data["workflow_runs"].clone())?;
        
        let mut statuses = Vec::new();
        
        for run in runs {
            let status = map_status(&run.status, &run.conclusion);
            let stages = self.get_stages(&client, &run.jobs_url).await?;
            
            statuses.push(CiStatus {
                provider: "GitHub Actions".to_string(),
                pipeline_id: run.id.to_string(),
                pipeline_name: run.name,
                status,
                commit_id: run.head_sha,
                branch: run.head_branch,
                author: String::new(),
                started_at: Some(run.created_at),
                finished_at: Some(run.updated_at),
                duration_seconds: run.updated_at
                    .signed_duration_since(run.created_at)
                    .num_seconds()
                    .try_into()
                    .ok(),
                url: run.html_url,
                stages,
            });
        }
        
        Ok(statuses)
    }
    
    async fn get_latest_pipelines(&self, limit: usize) -> CiCdResult<Vec<CiStatus>> {
        let client = reqwest::Client::new();
        let url = format!(
            "https://api.github.com/repos/{}/{}/actions/runs?per_page={}",
            self.owner, self.repo, limit
        );
        
        let response = client
            .get(&url)
            .header("Authorization", format!("Bearer {}", self.token))
            .header("Accept", "application/vnd.github.v3+json")
            .send()
            .await?;
        
        if !response.status().is_success() {
            return Err(crate::CiCdError::Api(format!(
                "GitHub API error: {}",
                response.status()
            )));
        }
        
        let data: serde_json::Value = response.json().await?;
        let runs: Vec<GitHubWorkflowRun> = serde_json::from_value(data["workflow_runs"].clone())?;
        
        let mut statuses = Vec::new();
        
        for run in runs {
            let status = map_status(&run.status, &run.conclusion);
            let stages = self.get_stages(&client, &run.jobs_url).await?;
            
            statuses.push(CiStatus {
                provider: "GitHub Actions".to_string(),
                pipeline_id: run.id.to_string(),
                pipeline_name: run.name,
                status,
                commit_id: run.head_sha,
                branch: run.head_branch,
                author: String::new(),
                started_at: Some(run.created_at),
                finished_at: Some(run.updated_at),
                duration_seconds: run.updated_at
                    .signed_duration_since(run.created_at)
                    .num_seconds()
                    .try_into()
                    .ok(),
                url: run.html_url,
                stages,
            });
        }
        
        Ok(statuses)
    }
    
    fn provider_name(&self) -> &str {
        "GitHub Actions"
    }
}

impl GitHubActions {
    async fn get_stages(&self, client: &reqwest::Client, jobs_url: &str) -> CiCdResult<Vec<StageStatus>> {
        let response = client
            .get(jobs_url)
            .header("Authorization", format!("Bearer {}", self.token))
            .header("Accept", "application/vnd.github.v3+json")
            .send()
            .await?;
        
        if !response.status().is_success() {
            return Ok(Vec::new());
        }
        
        let data: serde_json::Value = response.json().await?;
        let jobs: Vec<GitHubJob> = serde_json::from_value(data["jobs"].clone()).unwrap_or_default();
        
        let stages = jobs
            .into_iter()
            .map(|job| {
                let status = map_status(&job.status, &job.conclusion);
                let duration = job
                    .completed_at
                    .zip(job.started_at)
                    .map(|(end, start)| end.signed_duration_since(start).num_seconds() as u64);
                
                let jobs = vec![JobStatus {
                    name: job.name,
                    status,
                    started_at: job.started_at,
                    finished_at: job.completed_at,
                    duration_seconds: duration,
                    url: job.html_url,
                    logs_url: job.logs_url,
                }];
                
                StageStatus {
                    name: job.name,
                    status,
                    started_at: job.started_at,
                    finished_at: job.completed_at,
                    duration_seconds: duration,
                    jobs,
                }
            })
            .collect();
        
        Ok(stages)
    }
}
