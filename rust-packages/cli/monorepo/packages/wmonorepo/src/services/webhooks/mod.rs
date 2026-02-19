use crate::error::AppResult;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Duration;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebhookConfig {
    pub url: String,
    pub secret: Option<String>,
    pub events: Vec<WebhookEvent>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum WebhookEvent {
    TaskStart,
    TaskSuccess,
    TaskFailure,
    TaskRetry,
    CacheHit,
    CacheMiss,
    BuildStart,
    BuildComplete,
    BuildFailed,
}

#[derive(Debug, Clone, Serialize)]
pub struct WebhookPayload {
    pub event: WebhookEvent,
    pub timestamp: u64,
    pub workspace: String,
    pub task: String,
    pub hash: Option<String>,
    pub duration_ms: Option<u64>,
    pub metadata: HashMap<String, String>,
}

pub struct WebhookManager {
    client: Client,
    webhooks: Vec<WebhookConfig>,
}

impl WebhookManager {
    pub fn new() -> Self {
        WebhookManager {
            client: Client::builder()
                .timeout(Duration::from_secs(30))
                .build()
                .unwrap_or_default(),
            webhooks: Vec::new(),
        }
    }

    pub fn add_webhook(&mut self, config: WebhookConfig) {
        self.webhooks.push(config);
    }

    pub async fn emit(&self, payload: WebhookPayload) -> AppResult<()> {
        for webhook in &self.webhooks {
            if !webhook.events.contains(&payload.event) {
                continue;
            }

            let mut request = self.client.post(&webhook.url).json(&payload);

            if let Some(ref secret) = webhook.secret {
                request = request.header("X-Wmorepo-Secret", secret);
            }

            match request.send().await {
                Ok(response) => {
                    if !response.status().is_success() {
                        eprintln!(
                            "Webhook failed: {} returned {}",
                            webhook.url,
                            response.status()
                        );
                    }
                }
                Err(e) => {
                    eprintln!("Webhook error: {} - {}", webhook.url, e);
                }
            }
        }

        Ok(())
    }

    pub async fn task_start(&self, workspace: &str, task: &str, hash: Option<String>) {
        let payload = WebhookPayload {
            event: WebhookEvent::TaskStart,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
            workspace: workspace.to_string(),
            task: task.to_string(),
            hash,
            duration_ms: None,
            metadata: HashMap::new(),
        };

        self.emit(payload).await.ok();
    }

    pub async fn task_success(
        &self,
        workspace: &str,
        task: &str,
        hash: Option<String>,
        duration_ms: u64,
    ) {
        let payload = WebhookPayload {
            event: WebhookEvent::TaskSuccess,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
            workspace: workspace.to_string(),
            task: task.to_string(),
            hash,
            duration_ms: Some(duration_ms),
            metadata: HashMap::new(),
        };

        self.emit(payload).await.ok();
    }

    pub async fn task_failure(
        &self,
        workspace: &str,
        task: &str,
        hash: Option<String>,
        duration_ms: Option<u64>,
        error: &str,
    ) {
        let mut metadata = HashMap::new();
        metadata.insert("error".to_string(), error.to_string());

        let payload = WebhookPayload {
            event: WebhookEvent::TaskFailure,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
            workspace: workspace.to_string(),
            task: task.to_string(),
            hash,
            duration_ms,
            metadata,
        };

        self.emit(payload).await.ok();
    }

    pub async fn task_retry(
        &self,
        workspace: &str,
        task: &str,
        attempt: usize,
        max_retries: usize,
    ) {
        let mut metadata = HashMap::new();
        metadata.insert("attempt".to_string(), attempt.to_string());
        metadata.insert("max_retries".to_string(), max_retries.to_string());

        let payload = WebhookPayload {
            event: WebhookEvent::TaskRetry,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
            workspace: workspace.to_string(),
            task: task.to_string(),
            hash: None,
            duration_ms: None,
            metadata,
        };

        self.emit(payload).await.ok();
    }

    pub async fn cache_hit(&self, workspace: &str, task: &str, hash: &str) {
        let payload = WebhookPayload {
            event: WebhookEvent::CacheHit,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
            workspace: workspace.to_string(),
            task: task.to_string(),
            hash: Some(hash.to_string()),
            duration_ms: None,
            metadata: HashMap::new(),
        };

        self.emit(payload).await.ok();
    }

    pub async fn cache_miss(&self, workspace: &str, task: &str, hash: &str) {
        let payload = WebhookPayload {
            event: WebhookEvent::CacheMiss,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
            workspace: workspace.to_string(),
            task: task.to_string(),
            hash: Some(hash.to_string()),
            duration_ms: None,
            metadata: HashMap::new(),
        };

        self.emit(payload).await.ok();
    }

    pub async fn build_complete(&self, duration_ms: u64, tasks_count: usize) {
        let mut metadata = HashMap::new();
        metadata.insert("tasks_count".to_string(), tasks_count.to_string());

        let payload = WebhookPayload {
            event: WebhookEvent::BuildComplete,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
            workspace: "all".to_string(),
            task: "build".to_string(),
            hash: None,
            duration_ms: Some(duration_ms),
            metadata,
        };

        self.emit(payload).await.ok();
    }
}

impl Default for WebhookManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_webhook_manager() {
        let manager = WebhookManager::new();

        let config = WebhookConfig {
            url: "http://localhost:3000/webhook".to_string(),
            secret: Some("test-secret".to_string()),
            events: vec![WebhookEvent::TaskStart, WebhookEvent::TaskSuccess],
        };

        manager.add_webhook(config);
        assert_eq!(manager.webhooks.len(), 1);

        // Actual webhook calls would be tested with a mock server
    }
}
