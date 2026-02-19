use crate::error::Result;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsoleLogEntry {
    pub level: ConsoleLogLevel,
    pub message: String,
    pub url: Option<String>,
    pub line_number: Option<u32>,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConsoleLogLevel {
    Log,
    Warn,
    Error,
    Info,
    Debug,
}

#[async_trait]
pub trait ConsoleLogService: Send + Sync {
    async fn get_logs(&self, session_id: &str) -> Result<Vec<ConsoleLogEntry>>;
    async fn clear_logs(&self, session_id: &str) -> Result<()>;
    async fn filter_by_level(
        &self,
        session_id: &str,
        level: &ConsoleLogLevel,
    ) -> Result<Vec<ConsoleLogEntry>>;
}
