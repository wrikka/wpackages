//! In-memory storage service for testing

#[cfg(test)]
use async_trait::async_trait;
use std::sync::Arc;
use tokio::sync::RwLock;

#[cfg(test)]
use crate::error::{EvalError, EvalResult};
#[cfg(test)]
use super::service::StorageService;
#[cfg(test)]
use super::types::EvalSummary;
#[cfg(test)]
use crate::types::results::EvalResult as FullEvalResult;

#[cfg(test)]
/// In-memory storage service
pub struct MemoryStorageService {
    results: Arc<RwLock<std::collections::HashMap<String, FullEvalResult>>>,
}

#[cfg(test)]
impl MemoryStorageService {
    pub fn new() -> Self {
        Self {
            results: Arc::new(RwLock::new(std::collections::HashMap::new())),
        }
    }

    pub async fn clear(&self) {
        self.results.write().await.clear();
    }
}

#[cfg(test)]
#[async_trait]
impl StorageService for MemoryStorageService {
    async fn save_evaluation_result(&self, result: &FullEvalResult) -> EvalResult<()> {
        let mut results = self.results.write().await;
        results.insert(result.id.0.to_string(), result.clone());
        Ok(())
    }

    async fn load_evaluation_result(&self, eval_id: &str) -> EvalResult<FullEvalResult> {
        let results = self.results.read().await;
        results
            .get(eval_id)
            .cloned()
            .ok_or_else(|| EvalError::dataset_not_found(eval_id.to_string()))
    }

    async fn list_evaluations(&self) -> EvalResult<Vec<EvalSummary>> {
        let results = self.results.read().await;
        let mut summaries = Vec::new();

        for result in results.values() {
            let summary = EvalSummary::new(
                result.id.0.to_string(),
                result.name.clone(),
                format!("{:?}", result.status),
                result.started_at,
                result.completed_at,
                result.total_samples,
                result.pass_rate(),
            );
            summaries.push(summary);
        }

        // Sort by creation date (newest first)
        summaries.sort_by(|a, b| b.created_at.cmp(&a.created_at));

        Ok(summaries)
    }

    async fn delete_evaluation(&self, eval_id: &str) -> EvalResult<()> {
        let mut results = self.results.write().await;
        results.remove(eval_id);
        Ok(())
    }
}
