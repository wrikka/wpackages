use crate::{
    types::{Task, TaskStatus},
    Result,
};
use async_trait::async_trait;

#[async_trait]
pub trait TaskService: Send + Sync {
    async fn create_task(&self, agent_id: uuid::Uuid, description: String) -> Result<Task>;
    async fn get_task(&self, id: uuid::Uuid) -> Result<Task>;
    async fn update_task_status(&self, id: uuid::Uuid, status: TaskStatus) -> Result<Task>;
    async fn list_tasks(&self, agent_id: uuid::Uuid) -> Result<Vec<Task>>;
}

pub struct InMemoryTaskService {
    tasks: std::sync::Arc<tokio::sync::RwLock<std::collections::HashMap<uuid::Uuid, Task>>>,
}

impl InMemoryTaskService {
    pub fn new() -> Self {
        Self {
            tasks: std::sync::Arc::new(tokio::sync::RwLock::new(std::collections::HashMap::new())),
        }
    }
}

#[async_trait]
impl TaskService for InMemoryTaskService {
    async fn create_task(&self, agent_id: uuid::Uuid, description: String) -> Result<Task> {
        let task = crate::components::TaskComponent::create(agent_id, description);
        let mut tasks = self.tasks.write().await;
        tasks.insert(task.id, task.clone());
        Ok(task)
    }

    async fn get_task(&self, id: uuid::Uuid) -> Result<Task> {
        let tasks = self.tasks.read().await;
        tasks
            .get(&id)
            .cloned()
            .ok_or_else(|| crate::error::AgentError::TaskNotFound { task_id: id.to_string() })
    }

    async fn update_task_status(&self, id: uuid::Uuid, status: TaskStatus) -> Result<Task> {
        let mut tasks = self.tasks.write().await;
        if let Some(task) = tasks.get_mut(&id) {
            crate::components::TaskComponent::update_status(task, status);
            Ok(task.clone())
        } else {
            Err(crate::error::AgentError::TaskNotFound { task_id: id.to_string() })
        }
    }

    async fn list_tasks(&self, agent_id: uuid::Uuid) -> Result<Vec<Task>> {
        let tasks = self.tasks.read().await;
        Ok(tasks
            .values()
            .filter(|t| t.agent_id == agent_id)
            .cloned()
            .collect())
    }
}

impl Default for InMemoryTaskService {
    fn default() -> Self {
        Self::new()
    }
}
