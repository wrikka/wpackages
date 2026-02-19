use crate::domain::metrics::Metrics;
use crate::error::RagResult;
use crate::infrastructure::metric_stores::{InMemoryMetricStore, MetricStore};
use std::sync::Arc;

pub struct EvaluationService {
    metric_store: Arc<dyn MetricStore>,
}

impl EvaluationService {
    pub fn new() -> Self {
        Self {
            metric_store: Arc::new(InMemoryMetricStore::new()),
        }
    }

    pub async fn evaluate(&self, id: &str, ground_truth: &[String], retrieved_chunks: &[String]) -> RagResult<Metrics> {
        let retrieval_precision = self.calculate_retrieval_precision(ground_truth, retrieved_chunks);
        let metrics = Metrics {
            retrieval_precision,
            answer_relevance: 0.0, // Placeholder for now
        };
        self.metric_store.set(id, &metrics).await?;
        Ok(metrics)
    }

    fn calculate_retrieval_precision(&self, ground_truth: &[String], retrieved_chunks: &[String]) -> f32 {
        if ground_truth.is_empty() || retrieved_chunks.is_empty() {
            return 0.0;
        }
        let relevant_retrieved = retrieved_chunks.iter().filter(|c| ground_truth.contains(c)).count();
        relevant_retrieved as f32 / retrieved_chunks.len() as f32
    }

    pub async fn get_metrics(&self, id: &str) -> RagResult<Option<Metrics>> {
        self.metric_store.get(id).await
    }
}
