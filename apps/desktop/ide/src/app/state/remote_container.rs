use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContainerConfig {
    pub name: String,
    pub image: String,
    pub workspace_mount: PathBuf,
    pub ports: Vec<u16>,
    pub environment: Vec<String>,
    pub command: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContainerInstance {
    pub id: String,
    pub name: String,
    pub status: ContainerStatus,
    pub port_mappings: Vec<(u16, u16)>,
    pub created_at: String,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ContainerStatus {
    Stopped,
    Running,
    Starting,
    Error,
}

#[derive(Debug, Clone, Default)]
pub struct RemoteContainerState {
    pub configs: Vec<ContainerConfig>,
    pub instances: Vec<ContainerInstance>,
    pub active_instance: Option<String>,
    pub auto_start_enabled: bool,
}

impl RemoteContainerState {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn add_config(&mut self, config: ContainerConfig) {
        self.configs.push(config);
    }

    pub fn remove_config(&mut self, index: usize) {
        if index < self.configs.len() {
            self.configs.remove(index);
        }
    }

    pub fn start_container(&mut self, config: ContainerConfig) -> ContainerInstance {
        let instance = ContainerInstance {
            id: uuid::Uuid::new_v4().to_string(),
            name: config.name.clone(),
            status: ContainerStatus::Starting,
            port_mappings: Vec::new(),
            created_at: chrono::Utc::now().to_rfc3339(),
        };
        self.instances.push(instance.clone());
        instance
    }

    pub fn stop_container(&mut self, id: &str) {
        if let Some(instance) = self.instances.iter_mut().find(|i| i.id == id) {
            instance.status = ContainerStatus::Stopped;
        }
    }

    pub fn remove_container(&mut self, id: &str) {
        self.instances.retain(|i| i.id != id);
    }

    pub fn get_active(&self) -> Option<&ContainerInstance> {
        self.active_instance.as_ref()
            .and_then(|id| self.instances.iter().find(|i| i.id == *id))
    }

    pub fn set_active(&mut self, id: String) {
        self.active_instance = Some(id);
    }
}
