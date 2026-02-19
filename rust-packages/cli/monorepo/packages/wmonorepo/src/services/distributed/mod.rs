use crate::error::AppResult;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone)]
pub struct Worker {
    pub id: String,
    pub address: String,
    pub platform: String,
    pub capabilities: Vec<String>,
    pub busy: bool,
}

#[derive(Debug, Clone)]
pub struct BuildTask {
    pub id: String,
    pub workspace: String,
    pub task: String,
    pub hash: String,
    pub platform: Option<String>,
}

#[derive(Debug, Clone)]
pub enum WorkerMessage {
    Register(Worker),
    Unregister(String),
    TaskRequest(BuildTask),
    TaskResult {
        task_id: String,
        success: bool,
        output: String,
    },
    Heartbeat(String),
}

pub struct DistributedBuildSystem {
    workers: Arc<RwLock<HashMap<String, Worker>>>,
    task_queue: Arc<RwLock<Vec<BuildTask>>>,
    results: Arc<RwLock<HashMap<String, String>>>,
}

impl DistributedBuildSystem {
    pub fn new() -> Self {
        DistributedBuildSystem {
            workers: Arc::new(RwLock::new(HashMap::new())),
            task_queue: Arc::new(RwLock::new(Vec::new())),
            results: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn register_worker(&self, worker: Worker) -> AppResult<()> {
        let mut workers = self.workers.write().await;
        workers.insert(worker.id.clone(), worker);
        Ok(())
    }

    pub async fn unregister_worker(&self, worker_id: String) -> AppResult<()> {
        let mut workers = self.workers.write().await;
        workers.remove(&worker_id);
        Ok(())
    }

    pub async fn submit_task(&self, task: BuildTask) -> AppResult<()> {
        let mut queue = self.task_queue.write().await;
        queue.push(task);
        Ok(())
    }

    pub async fn get_available_worker(&self, platform: Option<&str>) -> Option<Worker> {
        let workers = self.workers.read().await;

        workers
            .values()
            .find(|w| !w.busy && platform.map_or(true, |p| w.platform.contains(p)))
            .cloned()
    }

    pub async fn assign_task(&self, task: BuildTask) -> AppResult<Option<Worker>> {
        let worker = self.get_available_worker(task.platform.as_deref()).await;

        if let Some(ref worker) = worker {
            let mut workers = self.workers.write().await;
            if let Some(w) = workers.get_mut(&worker.id) {
                w.busy = true;
            }
        }

        Ok(worker)
    }

    pub async fn complete_task(&self, task_id: String, output: String) -> AppResult<()> {
        let mut results = self.results.write().await;
        results.insert(task_id, output);

        // Mark worker as available
        let mut workers = self.workers.write().await;
        for worker in workers.values_mut() {
            worker.busy = false;
        }

        Ok(())
    }

    pub async fn get_task_result(&self, task_id: &str) -> Option<String> {
        let results = self.results.read().await;
        results.get(task_id).cloned()
    }

    pub async fn get_worker_count(&self) -> usize {
        let workers = self.workers.read().await;
        workers.len()
    }

    pub async fn get_queue_size(&self) -> usize {
        let queue = self.task_queue.read().await;
        queue.len()
    }
}

impl Default for DistributedBuildSystem {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_distributed_build_system() {
        let system = DistributedBuildSystem::new();

        let worker = Worker {
            id: "worker-1".to_string(),
            address: "localhost:50051".to_string(),
            platform: "linux".to_string(),
            capabilities: vec!["rust".to_string(), "typescript".to_string()],
            busy: false,
        };

        system.register_worker(worker.clone()).await.unwrap();
        assert_eq!(system.get_worker_count().await, 1);

        let task = BuildTask {
            id: "task-1".to_string(),
            workspace: "test".to_string(),
            task: "build".to_string(),
            hash: "abc123".to_string(),
            platform: None,
        };

        system.submit_task(task).await.unwrap();
        assert_eq!(system.get_queue_size().await, 1);
    }
}
