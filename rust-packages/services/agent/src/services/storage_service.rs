use crate::{
    types::{Agent, Message, Task, Tool},
    Result,
};
use async_trait::async_trait;
use uuid::Uuid;

#[async_trait]
pub trait StorageService: Send + Sync {
    async fn save_agent(&self, agent: &Agent) -> Result<()>;
    async fn get_agent(&self, id: Uuid) -> Result<Option<Agent>>;
    async fn list_agents(&self) -> Result<Vec<Agent>>;
    async fn delete_agent(&self, id: Uuid) -> Result<()>;

    async fn save_task(&self, task: &Task) -> Result<()>;
    async fn get_task(&self, id: Uuid) -> Result<Option<Task>>;
    async fn list_tasks(&self, agent_id: Uuid) -> Result<Vec<Task>>;
    async fn delete_task(&self, id: Uuid) -> Result<()>;

    async fn save_tool(&self, tool: &Tool) -> Result<()>;
    async fn get_tool(&self, id: Uuid) -> Result<Option<Tool>>;
    async fn list_tools(&self) -> Result<Vec<Tool>>;
    async fn delete_tool(&self, id: Uuid) -> Result<()>;

    async fn save_message(&self, message: &Message) -> Result<()>;
    async fn get_messages(&self, agent_id: Uuid, limit: usize) -> Result<Vec<Message>>;
    async fn delete_messages(&self, agent_id: Uuid) -> Result<()>;
}

pub struct InMemoryStorageService {
    agents: std::sync::Arc<tokio::sync::RwLock<std::collections::HashMap<Uuid, Agent>>>,
    tasks: std::sync::Arc<tokio::sync::RwLock<std::collections::HashMap<Uuid, Task>>>,
    tools: std::sync::Arc<tokio::sync::RwLock<std::collections::HashMap<Uuid, Tool>>>,
    messages: std::sync::Arc<tokio::sync::RwLock<std::collections::HashMap<Uuid, Message>>>,
}

impl InMemoryStorageService {
    pub fn new() -> Self {
        Self {
            agents: std::sync::Arc::new(tokio::sync::RwLock::new(std::collections::HashMap::new())),
            tasks: std::sync::Arc::new(tokio::sync::RwLock::new(std::collections::HashMap::new())),
            tools: std::sync::Arc::new(tokio::sync::RwLock::new(std::collections::HashMap::new())),
            messages: std::sync::Arc::new(tokio::sync::RwLock::new(
                std::collections::HashMap::new(),
            )),
        }
    }
}

#[async_trait]
impl StorageService for InMemoryStorageService {
    async fn save_agent(&self, agent: &Agent) -> Result<()> {
        let mut agents = self.agents.write().await;
        agents.insert(agent.id, agent.clone());
        Ok(())
    }

    async fn get_agent(&self, id: Uuid) -> Result<Option<Agent>> {
        let agents = self.agents.read().await;
        Ok(agents.get(&id).cloned())
    }

    async fn list_agents(&self) -> Result<Vec<Agent>> {
        let agents = self.agents.read().await;
        Ok(agents.values().cloned().collect())
    }

    async fn delete_agent(&self, id: Uuid) -> Result<()> {
        let mut agents = self.agents.write().await;
        agents.remove(&id);
        Ok(())
    }

    async fn save_task(&self, task: &Task) -> Result<()> {
        let mut tasks = self.tasks.write().await;
        tasks.insert(task.id, task.clone());
        Ok(())
    }

    async fn get_task(&self, id: Uuid) -> Result<Option<Task>> {
        let tasks = self.tasks.read().await;
        Ok(tasks.get(&id).cloned())
    }

    async fn list_tasks(&self, agent_id: Uuid) -> Result<Vec<Task>> {
        let tasks = self.tasks.read().await;
        Ok(tasks
            .values()
            .filter(|t| t.agent_id == agent_id)
            .cloned()
            .collect())
    }

    async fn delete_task(&self, id: Uuid) -> Result<()> {
        let mut tasks = self.tasks.write().await;
        tasks.remove(&id);
        Ok(())
    }

    async fn save_tool(&self, tool: &Tool) -> Result<()> {
        let mut tools = self.tools.write().await;
        tools.insert(tool.id, tool.clone());
        Ok(())
    }

    async fn get_tool(&self, id: Uuid) -> Result<Option<Tool>> {
        let tools = self.tools.read().await;
        Ok(tools.get(&id).cloned())
    }

    async fn list_tools(&self) -> Result<Vec<Tool>> {
        let tools = self.tools.read().await;
        Ok(tools.values().cloned().collect())
    }

    async fn delete_tool(&self, id: Uuid) -> Result<()> {
        let mut tools = self.tools.write().await;
        tools.remove(&id);
        Ok(())
    }

    async fn save_message(&self, message: &Message) -> Result<()> {
        let mut messages = self.messages.write().await;
        messages.insert(message.id, message.clone());
        Ok(())
    }

    async fn get_messages(&self, agent_id: Uuid, limit: usize) -> Result<Vec<Message>> {
        let messages = self.messages.read().await;
        let mut filtered: Vec<_> = messages
            .values()
            .filter(|m| m.agent_id == agent_id)
            .cloned()
            .collect();
        filtered.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
        filtered.truncate(limit);
        Ok(filtered)
    }

    async fn delete_messages(&self, agent_id: Uuid) -> Result<()> {
        let mut messages = self.messages.write().await;
        messages.retain(|_, m| m.agent_id != agent_id);
        Ok(())
    }
}

impl Default for InMemoryStorageService {
    fn default() -> Self {
        Self::new()
    }
}
