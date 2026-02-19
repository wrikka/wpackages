use crate::error::Result;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadItem {
    pub id: String,
    pub url: String,
    pub filename: String,
    pub mime_type: Option<String>,
    pub state: DownloadState,
    pub progress: f32,
    pub total_bytes: Option<u64>,
    pub received_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DownloadState {
    InProgress,
    Completed,
    Cancelled,
    Interrupted,
}

#[async_trait]
pub trait FileDownloadService: Send + Sync {
    async fn get_downloads(&self, session_id: &str) -> Result<Vec<DownloadItem>>;
    async fn cancel_download(&self, session_id: &str, download_id: &str) -> Result<()>;
    async fn get_download_path(
        &self,
        session_id: &str,
        download_id: &str,
    ) -> Result<Option<String>>;
    async fn set_download_directory(&self, session_id: &str, path: &str) -> Result<()>;
    async fn wait_for_download(
        &self,
        session_id: &str,
        download_id: &str,
        timeout_ms: u64,
    ) -> Result<DownloadItem>;
}
