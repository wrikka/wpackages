use super::MetricStore;
use crate::domain::metrics::Metrics;
use crate::error::RagResult;
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Default)]
pub struct InMemoryMetricStore {
    metrics: Arc<RwLock<HashMap<String, Metrics>>>,
}

impl InMemoryMetricStore {
    pub fn new() -> Self {
        Self::default()
    }
}

#[async_trait]
impl MetricStore for InMemoryMetricStore {
    async fn get(&self, id: &str) -> RagResult<Option<Metrics>> {
        let metrics = self.metrics.read().await;
        Ok(metrics.get(id).cloned())
    }

    async fn set(&self, id: &str, metrics: &Metrics) -> RagResult<()> {
        let mut store = self.metrics.write().await;
        store.insert(id.to_string(), metrics.clone());
        Ok(())
    }
}
