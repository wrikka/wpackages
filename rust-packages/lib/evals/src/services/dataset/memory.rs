//! In-memory dataset service for testing

#[cfg(test)]
use async_trait::async_trait;
use std::sync::Arc;
use tokio::sync::RwLock;

#[cfg(test)]
use crate::error::{EvalError, EvalResult};
#[cfg(test)]
use super::service::DatasetService;
#[cfg(test)]
use super::types::{Dataset, DatasetInfo};

#[cfg(test)]
/// In-memory dataset service
pub struct MemoryDatasetService {
    datasets: Arc<RwLock<std::collections::HashMap<String, Dataset>>>,
}

#[cfg(test)]
impl MemoryDatasetService {
    pub fn new() -> Self {
        Self {
            datasets: Arc::new(RwLock::new(std::collections::HashMap::new())),
        }
    }

    pub async fn clear(&self) {
        self.datasets.write().await.clear();
    }

    pub async fn add_dataset(&self, dataset: Dataset) {
        let mut datasets = self.datasets.write().await;
        datasets.insert(dataset.info.id.clone(), dataset);
    }
}

#[cfg(test)]
#[async_trait]
impl DatasetService for MemoryDatasetService {
    async fn load_dataset(&self, dataset_id: &str) -> EvalResult<Dataset> {
        let datasets = self.datasets.read().await;
        datasets
            .get(dataset_id)
            .cloned()
            .ok_or_else(|| EvalError::dataset_not_found(dataset_id.to_string()))
    }

    async fn list_datasets(&self) -> EvalResult<Vec<DatasetInfo>> {
        let datasets = self.datasets.read().await;
        let mut infos = Vec::new();

        for dataset in datasets.values() {
            infos.push(dataset.info.clone());
        }

        // Sort by creation date (newest first)
        infos.sort_by(|a, b| b.created_at.cmp(&a.created_at));

        Ok(infos)
    }

    async fn get_dataset_info(&self, dataset_id: &str) -> EvalResult<DatasetInfo> {
        let datasets = self.datasets.read().await;
        datasets
            .get(dataset_id)
            .map(|d| d.info.clone())
            .ok_or_else(|| EvalError::dataset_not_found(dataset_id.to_string()))
    }

    async fn save_dataset(&self, dataset: &Dataset) -> EvalResult<()> {
        let mut datasets = self.datasets.write().await;
        datasets.insert(dataset.info.id.clone(), dataset.clone());
        Ok(())
    }

    async fn delete_dataset(&self, dataset_id: &str) -> EvalResult<()> {
        let mut datasets = self.datasets.write().await;
        datasets.remove(dataset_id);
        Ok(())
    }
}
