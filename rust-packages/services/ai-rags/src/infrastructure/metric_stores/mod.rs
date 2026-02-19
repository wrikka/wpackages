use crate::domain::metrics::Metrics;
use crate::error::RagResult;
use async_trait::async_trait;

#[async_trait]
pub trait MetricStore: Send + Sync {
    async fn get(&self, id: &str) -> RagResult<Option<Metrics>>;
    async fn set(&self, id: &str, metrics: &Metrics) -> RagResult<()>;
}

pub mod in_memory_metric_store;

pub use in_memory_metric_store::InMemoryMetricStore;
