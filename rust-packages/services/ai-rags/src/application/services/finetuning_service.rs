use crate::domain::finetuning::{Dataset, FineTuningJob, FineTuningJobStatus};
use crate::error::RagResult;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

#[derive(Default)]
pub struct FineTuningService {
    jobs: Arc<Mutex<HashMap<String, FineTuningJob>>>,
    datasets: Arc<Mutex<HashMap<String, Dataset>>>,
}

impl FineTuningService {
    pub fn new() -> Self {
        Self::default()
    }

    pub async fn create_dataset(&self, name: &str) -> RagResult<Dataset> {
        let id = uuid::Uuid::new_v4().to_string();
        let dataset = Dataset { id: id.clone(), name: name.to_string() };
        let mut datasets = self.datasets.lock().unwrap();
        datasets.insert(id.clone(), dataset.clone());
        Ok(dataset)
    }

    pub async fn start_fine_tuning_job(&self, dataset_id: &str) -> RagResult<FineTuningJob> {
        let job_id = uuid::Uuid::new_v4().to_string();
        let job = FineTuningJob {
            id: job_id.clone(),
            status: FineTuningJobStatus::Pending,
            model_id: None,
        };
        let mut jobs = self.jobs.lock().unwrap();
        jobs.insert(job_id.clone(), job.clone());
        Ok(job)
    }

    pub async fn get_job_status(&self, job_id: &str) -> RagResult<Option<FineTuningJob>> {
        let jobs = self.jobs.lock().unwrap();
        Ok(jobs.get(job_id).cloned())
    }
}
