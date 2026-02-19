use futures::future::join_all;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{debug, warn};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchRequest {
    pub id: String,
    pub method: String,
    pub params: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchResponse {
    pub id: String,
    pub result: Option<serde_json::Value>,
    pub error: Option<String>,
}

#[derive(Debug, Clone)]
pub struct BatchOperation {
    pub requests: Vec<BatchRequest>,
    pub transaction_id: Option<String>,
}

#[derive(Debug, Clone)]
pub struct BatchConfig {
    pub max_batch_size: usize,
    pub timeout_ms: u64,
    pub parallel_execution: bool,
}

impl Default for BatchConfig {
    fn default() -> Self {
        Self {
            max_batch_size: 100,
            timeout_ms: 30000,
            parallel_execution: true,
        }
    }
}

pub struct BatchExecutor {
    config: BatchConfig,
    results: Arc<RwLock<HashMap<String, BatchResponse>>>,
}

impl BatchExecutor {
    pub fn new(config: BatchConfig) -> Self {
        Self {
            config,
            results: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn execute_batch<F, Fut>(
        &self,
        batch: BatchOperation,
        handler: F,
    ) -> Vec<BatchResponse>
    where
        F: Fn(BatchRequest) -> Fut + Clone + Send + Sync + 'static,
        Fut: std::future::Future<Output = Result<serde_json::Value, String>> + Send + 'static,
    {
        let batch_size = batch.requests.len();

        if batch_size > self.config.max_batch_size {
            warn!(
                "Batch size {} exceeds maximum {}, truncating",
                batch_size, self.config.max_batch_size
            );
        }

        let requests_to_process = batch
            .requests
            .into_iter()
            .take(self.config.max_batch_size)
            .collect::<Vec<_>>();

        if self.config.parallel_execution {
            self.execute_parallel(requests_to_process, handler).await
        } else {
            self.execute_sequential(requests_to_process, handler).await
        }
    }

    async fn execute_parallel<F, Fut>(
        &self,
        requests: Vec<BatchRequest>,
        handler: F,
    ) -> Vec<BatchResponse>
    where
        F: Fn(BatchRequest) -> Fut + Clone + Send + Sync + 'static,
        Fut: std::future::Future<Output = Result<serde_json::Value, String>> + Send,
    {
        let futures = requests.into_iter().map(|req| {
            let id = req.id.clone();
            let handler = handler.clone();
            async move {
                let result = handler(req).await;
                let result_clone = result.clone();
                BatchResponse {
                    id,
                    result: result.ok(),
                    error: result_clone.err(),
                }
            }
        });

        let responses = futures::future::join_all(futures).await;
        responses
    }

    async fn execute_sequential<F, Fut>(
        &self,
        requests: Vec<BatchRequest>,
        handler: F,
    ) -> Vec<BatchResponse>
    where
        F: Fn(BatchRequest) -> Fut + Clone,
        Fut: std::future::Future<Output = Result<serde_json::Value, String>>,
    {
        let mut responses = Vec::new();

        for req in requests {
            let id = req.id.clone();
            let result = handler(req).await;
            let result_clone = result.clone();
            responses.push(BatchResponse {
                id,
                result: result.ok(),
                error: result_clone.err(),
            });
        }

        responses
    }

    pub async fn store_result(&self, response: BatchResponse) {
        let mut results = self.results.write().await;
        results.insert(response.id.clone(), response);
    }

    pub async fn get_result(&self, id: &str) -> Option<BatchResponse> {
        let results = self.results.read().await;
        results.get(id).cloned()
    }

    pub async fn clear_results(&self) {
        let mut results = self.results.write().await;
        results.clear();
    }
}
