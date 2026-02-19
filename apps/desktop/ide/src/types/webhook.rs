use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "event_type")]
pub enum WebhookEvent {
    GitHubActions(GitHubActionsEvent),
    GitLabCI(GitLabCIEvent),
    Jenkins(JenkinsEvent),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitHubActionsEvent {
    pub action: String,
    pub workflow_run: WorkflowRunData,
    pub repository: RepositoryData,
    pub sender: SenderData,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowRunData {
    pub id: u64,
    pub name: String,
    pub status: String,
    pub conclusion: Option<String>,
    pub head_sha: String,
    pub head_branch: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub html_url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RepositoryData {
    pub full_name: String,
    pub html_url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SenderData {
    pub login: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitLabCIEvent {
    pub object_kind: String,
    pub object_attributes: ObjectAttributes,
    pub project: ProjectData,
    pub user: UserData,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ObjectAttributes {
    pub id: u64,
    pub status: String,
    pub sha: String,
    pub ref: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectData {
    pub name: String,
    pub web_url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserData {
    pub name: String,
    pub username: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JenkinsEvent {
    pub name: String,
    pub build: BuildData,
    pub project: ProjectData,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuildData {
    pub number: u64,
    pub status: String,
    pub url: String,
    pub timestamp: u64,
}
