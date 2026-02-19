// Build status sharing

use std::sync::Arc;
use tokio::sync::RwLock;

pub struct BuildStatus {
    status: Arc<RwLock<Vec<BuildEvent>>>,
}

impl BuildStatus {
    pub fn new() -> Self {
        BuildStatus {
            status: Arc::new(RwLock::new(Vec::new())),
        }
    }

    pub async fn add_event(&self, event: BuildEvent) {
        let mut status = self.status.write().await;
        status.push(event);
    }

    pub async fn get_events(&self) -> Vec<BuildEvent> {
        let status = self.status.read().await;
        status.clone()
    }
}

#[derive(Debug, Clone)]
pub struct BuildEvent {
    pub task: String,
    pub status: String,
    pub timestamp: u64,
}

impl Default for BuildStatus {
    fn default() -> Self {
        Self::new()
    }
}
