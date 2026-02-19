use crate::application::services::rag_service::RagService;
use crate::domain::jobs::{Job, JobStatus};
use crate::error::RagResult;
use crate::infrastructure::job_stores::{InMemoryJobStore, JobStore};
use std::sync::Arc;

pub struct JobService {
    rag_service: Arc<RagService>,
    job_store: Arc<dyn JobStore>,
}

impl JobService {
    pub fn new(rag_service: Arc<RagService>) -> Self {
        Self {
            rag_service,
            job_store: Arc::new(InMemoryJobStore::new()),
        }
    }

    pub async fn start_document_processing_job(&self, paths: Vec<String>) -> RagResult<String> {
        let job_id = uuid::Uuid::new_v4().to_string();
        let job = Job {
            id: job_id.clone(),
            status: JobStatus::Pending,
            message: None,
        };
        self.job_store.set(&job).await?;

        let rag_service = self.rag_service.clone();
        let job_store = self.job_store.clone();
        let job_id_clone = job_id.clone();

        tokio::spawn(async move {
            let mut job = job_store.get(&job_id_clone).await.unwrap().unwrap();
            job.status = JobStatus::Processing;
            job_store.set(&job).await.unwrap();

            let paths_str: Vec<&str> = paths.iter().map(|s| s.as_str()).collect();
            match rag_service.retrieve("", &paths_str, None).await {
                Ok(_) => {
                    job.status = JobStatus::Completed;
                    job_store.set(&job).await.unwrap();
                }
                Err(e) => {
                    job.status = JobStatus::Failed;
                    job.message = Some(e.to_string());
                    job_store.set(&job).await.unwrap();
                }
            }
        });

        Ok(job_id)
    }

    pub async fn get_job_status(&self, job_id: &str) -> RagResult<Option<Job>> {
        self.job_store.get(job_id).await
    }
}
