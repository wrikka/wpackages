use crate::{types::Agent, Result};
use async_trait::async_trait;

#[async_trait]
pub trait AgentService: Send + Sync {
    async fn create_agent(&self, name: String, description: Option<String>) -> Result<Agent>;
    async fn get_agent(&self, id: uuid::Uuid) -> Result<Agent>;
    async fn update_agent(&self, agent: Agent) -> Result<Agent>;
    async fn delete_agent(&self, id: uuid::Uuid) -> Result<()>;
}

pub struct InMemoryAgentService {
    agents: std::sync::Arc<tokio::sync::RwLock<std::collections::HashMap<uuid::Uuid, Agent>>>,
}

impl InMemoryAgentService {
    pub fn new() -> Self {
        Self {
            agents: std::sync::Arc::new(tokio::sync::RwLock::new(std::collections::HashMap::new())),
        }
    }
}

#[async_trait]
impl AgentService for InMemoryAgentService {
    async fn create_agent(&self, name: String, description: Option<String>) -> Result<Agent> {
        let agent = crate::components::AgentComponent::create(name, description);
        let mut agents = self.agents.write().await;
        agents.insert(agent.id, agent.clone());
        Ok(agent)
    }

    async fn get_agent(&self, id: uuid::Uuid) -> Result<Agent> {
        let agents = self.agents.read().await;
        agents
            .get(&id)
            .cloned()
            .ok_or_else(|| crate::error::AgentError::AgentNotFound {
                agent_id: id.to_string(),
            })
    }

    async fn update_agent(&self, agent: Agent) -> Result<Agent> {
        let mut agents = self.agents.write().await;
        agents.insert(agent.id, agent.clone());
        Ok(agent)
    }

    async fn delete_agent(&self, id: uuid::Uuid) -> Result<()> {
        let mut agents = self.agents.write().await;
        agents
            .remove(&id)
            .ok_or_else(|| crate::error::AgentError::AgentNotFound {
                agent_id: id.to_string(),
            })?;
        Ok(())
    }
}

impl Default for InMemoryAgentService {
    fn default() -> Self {
        Self::new()
    }
}
