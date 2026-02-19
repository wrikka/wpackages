use crate::{
    adapters::{BrowserAdapter, CacheAdapter, EmbeddingsAdapter},
    Result,
};
use async_trait::async_trait;
use serde_json::Value;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct ToolExecution {
    pub id: Uuid,
    pub tool_name: String,
    pub parameters: Value,
    pub result: Option<Value>,
    pub status: ToolExecutionStatus,
    pub error: Option<String>,
    pub duration_ms: u64,
}

#[derive(Debug, Clone, PartialEq)]
pub enum ToolExecutionStatus {
    Pending,
    Running,
    Completed,
    Failed,
    Timeout,
}

#[async_trait]
pub trait ToolExecutor: Send + Sync {
    async fn execute_tool(&self, tool_name: &str, parameters: Value) -> Result<ToolExecution>;
    async fn get_execution(&self, id: Uuid) -> Result<Option<ToolExecution>>;
    async fn list_executions(&self) -> Result<Vec<ToolExecution>>;
}

pub struct SafeToolExecutor {
    browser: Option<std::sync::Arc<dyn BrowserAdapter>>,
    cache: Option<std::sync::Arc<dyn CacheAdapter>>,
    embeddings: Option<std::sync::Arc<dyn EmbeddingsAdapter>>,
    executions: std::sync::Arc<tokio::sync::RwLock<std::collections::HashMap<Uuid, ToolExecution>>>,
    max_execution_time_ms: u64,
}

impl SafeToolExecutor {
    pub fn new() -> Self {
        Self {
            browser: None,
            cache: None,
            embeddings: None,
            executions: std::sync::Arc::new(tokio::sync::RwLock::new(
                std::collections::HashMap::new(),
            )),
            max_execution_time_ms: 30000,
        }
    }

    pub fn with_browser(mut self, browser: std::sync::Arc<dyn BrowserAdapter>) -> Self {
        self.browser = Some(browser);
        self
    }

    pub fn with_cache(mut self, cache: std::sync::Arc<dyn CacheAdapter>) -> Self {
        self.cache = Some(cache);
        self
    }

    pub fn with_embeddings(mut self, embeddings: std::sync::Arc<dyn EmbeddingsAdapter>) -> Self {
        self.embeddings = Some(embeddings);
        self
    }

    pub fn with_max_execution_time(mut self, max_ms: u64) -> Self {
        self.max_execution_time_ms = max_ms;
        self
    }

    async fn execute_browser_tool(&self, parameters: Value) -> Result<Value> {
        let browser =
            self.browser
                .as_ref()
                .ok_or_else(|| crate::error::AgentError::ToolExecutionFailed {
                    tool_name: "browser".to_string(),
                    source: anyhow::anyhow!("Browser adapter not configured"),
                })?;

        let action = parameters
            .get("action")
            .and_then(|v| v.as_str())
            .ok_or_else(|| {
                crate::error::AgentError::InvalidInput("Missing action parameter".to_string())
            })?;

        match action {
            "navigate" => {
                let url = parameters
                    .get("url")
                    .and_then(|v| v.as_str())
                    .ok_or_else(|| {
                        crate::error::AgentError::InvalidInput("Missing url parameter".to_string())
                    })?;

                let browser_id = parameters
                    .get("browser_id")
                    .and_then(|v| v.as_str())
                    .unwrap_or("default");

                browser.navigate(browser_id, url).await?;
                Ok(serde_json::json!({ "success": true }))
            }
            "screenshot" => {
                let browser_id = parameters
                    .get("browser_id")
                    .and_then(|v| v.as_str())
                    .unwrap_or("default");

                let screenshot = browser.take_screenshot(browser_id).await?;
                Ok(serde_json::json!({ "success": true, "size": screenshot.len() }))
            }
            _ => Err(crate::error::AgentError::InvalidInput(format!(
                "Unknown browser action: {}",
                action
            ))),
        }
    }

    async fn execute_cache_tool(&self, parameters: Value) -> Result<Value> {
        let cache =
            self.cache
                .as_ref()
                .ok_or_else(|| crate::error::AgentError::ToolExecutionFailed {
                    tool_name: "cache".to_string(),
                    source: anyhow::anyhow!("Cache adapter not configured"),
                })?;

        let action = parameters
            .get("action")
            .and_then(|v| v.as_str())
            .ok_or_else(|| {
                crate::error::AgentError::InvalidInput("Missing action parameter".to_string())
            })?;

        match action {
            "get" => {
                let key = parameters
                    .get("key")
                    .and_then(|v| v.as_str())
                    .ok_or_else(|| {
                        crate::error::AgentError::InvalidInput("Missing key parameter".to_string())
                    })?;

                let value = cache.get(key).await?;
                Ok(serde_json::json!({ "found": value.is_some(), "value": value }))
            }
            "set" => {
                let key = parameters
                    .get("key")
                    .and_then(|v| v.as_str())
                    .ok_or_else(|| {
                        crate::error::AgentError::InvalidInput("Missing key parameter".to_string())
                    })?;

                let value = parameters
                    .get("value")
                    .and_then(|v| v.as_str())
                    .ok_or_else(|| {
                        crate::error::AgentError::InvalidInput(
                            "Missing value parameter".to_string(),
                        )
                    })?;

                let ttl = parameters
                    .get("ttl")
                    .and_then(|v| v.as_u64())
                    .unwrap_or(3600);

                cache.set(key, value.as_bytes().to_vec(), ttl).await?;
                Ok(serde_json::json!({ "success": true }))
            }
            _ => Err(crate::error::AgentError::InvalidInput(format!(
                "Unknown cache action: {}",
                action
            ))),
        }
    }

    async fn execute_embeddings_tool(&self, parameters: Value) -> Result<Value> {
        let embeddings = self.embeddings.as_ref().ok_or_else(|| {
            crate::error::AgentError::ToolExecutionFailed {
                tool_name: "embeddings".to_string(),
                source: anyhow::anyhow!("Embeddings adapter not configured"),
            }
        })?;

        let action = parameters
            .get("action")
            .and_then(|v| v.as_str())
            .ok_or_else(|| {
                crate::error::AgentError::InvalidInput("Missing action parameter".to_string())
            })?;

        match action {
            "generate" => {
                let text = parameters
                    .get("text")
                    .and_then(|v| v.as_str())
                    .ok_or_else(|| {
                        crate::error::AgentError::InvalidInput("Missing text parameter".to_string())
                    })?;

                let embedding = embeddings.generate_embedding(text).await?;
                Ok(serde_json::json!({ "embedding": embedding, "dimension": embedding.len() }))
            }
            _ => Err(crate::error::AgentError::InvalidInput(format!(
                "Unknown embeddings action: {}",
                action
            ))),
        }
    }
}

#[async_trait]
impl ToolExecutor for SafeToolExecutor {
    async fn execute_tool(&self, tool_name: &str, parameters: Value) -> Result<ToolExecution> {
        let id = Uuid::new_v4();
        let start = std::time::Instant::now();

        let mut execution = ToolExecution {
            id,
            tool_name: tool_name.to_string(),
            parameters: parameters.clone(),
            result: None,
            status: ToolExecutionStatus::Running, // Set to Running immediately
            error: None,
            duration_ms: 0,
        };

        self.executions.write().await.insert(id, execution.clone());

        let result = tokio::time::timeout(
            tokio::time::Duration::from_millis(self.max_execution_time_ms),
            async {
                match tool_name {
                    "browser" => self.execute_browser_tool(parameters).await,
                    "cache" => self.execute_cache_tool(parameters).await,
                    "embeddings" => self.execute_embeddings_tool(parameters).await,
                    _ => Err(crate::error::AgentError::InvalidInput(format!(
                        "Unknown tool: {}",
                        tool_name
                    ))),
                }
            },
        )
        .await;

        let duration_ms = start.elapsed().as_millis() as u64;
        execution.duration_ms = duration_ms;

        match result {
            Ok(Ok(value)) => {
                execution.result = Some(value);
                execution.status = ToolExecutionStatus::Completed;
            }
            Ok(Err(e)) => {
                execution.error = Some(e.to_string());
                execution.status = ToolExecutionStatus::Failed;
            }
            Err(_) => {
                execution.error = Some("Tool execution timeout".to_string());
                execution.status = ToolExecutionStatus::Timeout;
            }
        }

        {
            let mut executions = self.executions.write().await;
            executions.insert(id, execution.clone());
        }

        Ok(execution)
    }

    async fn get_execution(&self, id: Uuid) -> Result<Option<ToolExecution>> {
        let executions = self.executions.read().await;
        Ok(executions.get(&id).cloned())
    }

    async fn list_executions(&self) -> Result<Vec<ToolExecution>> {
        let executions = self.executions.read().await;
        Ok(executions.values().cloned().collect())
    }
}

impl Default for SafeToolExecutor {
    fn default() -> Self {
        Self::new()
    }
}
