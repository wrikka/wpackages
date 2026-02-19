use crate::domain::jobs::Job;
use crate::error::RagResult;
use async_trait::async_trait;

#[async_trait]
pub trait JobStore: Send + Sync {
    async fn get(&self, id: &str) -> RagResult<Option<Job>>;
    async fn set(&self, job: &Job) -> RagResult<()>;
}

pub mod in_memory_job_store;

pub use in_memory_job_store::InMemoryJobStore;
