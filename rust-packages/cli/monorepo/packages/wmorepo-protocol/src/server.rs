// gRPC server for distributed builds

use tokio::sync::mpsc;

/// Distributed build server
pub struct DistributedBuildServer {
    task_rx: mpsc::Receiver<TaskRequest>,
}

impl DistributedBuildServer {
    pub fn new(task_rx: mpsc::Receiver<TaskRequest>) -> Self {
        DistributedBuildServer { task_rx }
    }

    pub async fn run(&mut self) {
        while let Some(task) = self.task_rx.recv().await {
            // Process task
            println!("Processing task: {}", task.task_id);
        }
    }
}

/// Task request (shared with client)
#[derive(Debug, Clone)]
pub struct TaskRequest {
    pub task_id: String,
    pub workspace: String,
    pub task_name: String,
    pub inputs: Vec<String>,
}
