//! Dataset service trait

use async_trait::async_trait;
use crate::error::{EvalError, EvalResult};
use super::types::{Dataset, DatasetInfo};

/// Trait for dataset operations (I/O layer)
#[async_trait]
pub trait DatasetService: Send + Sync {
    async fn load_dataset(&self, dataset_id: &str) -> EvalResult<Dataset>;
    async fn list_datasets(&self) -> EvalResult<Vec<DatasetInfo>>;
    async fn get_dataset_info(&self, dataset_id: &str) -> EvalResult<DatasetInfo>;
    async fn save_dataset(&self, dataset: &Dataset) -> EvalResult<()>;
    async fn delete_dataset(&self, dataset_id: &str) -> EvalResult<()>;
}
