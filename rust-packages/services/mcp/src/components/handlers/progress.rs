use crate::error::Result;
use crate::types::protocol::{Id, Response};
use serde_json::json;

#[derive(Debug, Clone)]
pub struct Progress {
    pub progress_token: String,
    pub progress: f64,
    pub total: Option<f64>,
    pub message: Option<String>,
}

pub struct ProgressHandler {
    progress_tokens: Vec<String>,
}

impl ProgressHandler {
    pub fn new() -> Self {
        Self {
            progress_tokens: Vec::new(),
        }
    }

    pub fn create_progress_notification(&self, progress: Progress) -> crate::types::protocol::Notification {
        crate::types::protocol::Notification {
            jsonrpc: "2.0".to_string(),
            method: "notifications/progress".to_string(),
            params: Some(json!({
                "progressToken": progress.progress_token,
                "progress": progress.progress,
                "total": progress.total,
                "message": progress.message,
            })),
        }
    }

    pub fn create_progress_complete_notification(&self, progress_token: String) -> crate::types::protocol::Notification {
        crate::types::protocol::Notification {
            jsonrpc: "2.0".to_string(),
            method: "notifications/progress".to_string(),
            params: Some(json!({
                "progressToken": progress_token,
                "progress": 1.0,
            })),
        }
    }
}

impl Default for ProgressHandler {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_progress_notification() {
        let handler = ProgressHandler::new();
        let progress = Progress {
            progress_token: "token1".to_string(),
            progress: 0.5,
            total: Some(1.0),
            message: Some("Processing".to_string()),
        };

        let notification = handler.create_progress_notification(progress);
        assert_eq!(notification.method, "notifications/progress");
    }
}
