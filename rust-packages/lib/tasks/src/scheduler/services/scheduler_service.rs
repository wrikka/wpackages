use crate::{
    config::SchedulerConfig,
    error::SchedulerError,
    storage::{InMemoryStorage, SchedulerStorage, ThreadSafeStorage},
    Result,
};
use std::sync::Arc;
use tokio::sync::Semaphore;
use tracing::{debug, error, info};

pub struct SchedulerService {
    config: SchedulerConfig,
    storage: ThreadSafeStorage,
    semaphore: Arc<Semaphore>,
}

impl SchedulerService {
    pub fn new(config: SchedulerConfig) -> Result<Self> {
        let storage = ThreadSafeStorage::new(InMemoryStorage::new());
        let semaphore = Arc::new(Semaphore::new(config.max_concurrent_jobs));

        Ok(Self {
            config,
            storage,
            semaphore,
        })
    }

    pub fn storage(&self) -> &ThreadSafeStorage {
        &self.storage
    }

    pub async fn schedule_task(&self, task_id: String) -> Result<()> {
        let _permit = self
            .semaphore
            .acquire()
            .await
            .map_err(|_| SchedulerError::SchedulerBusy)?;

        debug!("Scheduling task: {}", task_id);
        info!("Task scheduled: {}", task_id);

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_scheduler_service_creation() {
        let config = SchedulerConfig {
            max_concurrent_jobs: 10,
            job_timeout_ms: 30000,
        };

        let service = SchedulerService::new(config);
        assert!(service.is_ok());
    }
}
