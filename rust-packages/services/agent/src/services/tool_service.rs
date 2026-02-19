use crate::{types::Tool, Result};
use async_trait::async_trait;

#[async_trait]
pub trait ToolService: Send + Sync {
    async fn create_tool(&self, name: String, description: String) -> Result<Tool>;
    async fn get_tool(&self, id: uuid::Uuid) -> Result<Tool>;
    async fn enable_tool(&self, id: uuid::Uuid) -> Result<Tool>;
    async fn disable_tool(&self, id: uuid::Uuid) -> Result<Tool>;
    async fn list_tools(&self) -> Result<Vec<Tool>>;
}

pub struct InMemoryToolService {
    tools: std::sync::Arc<tokio::sync::RwLock<std::collections::HashMap<uuid::Uuid, Tool>>>,
}

impl InMemoryToolService {
    pub fn new() -> Self {
        Self {
            tools: std::sync::Arc::new(tokio::sync::RwLock::new(std::collections::HashMap::new())),
        }
    }
}

#[async_trait]
impl ToolService for InMemoryToolService {
    async fn create_tool(&self, name: String, description: String) -> Result<Tool> {
        let tool = crate::components::ToolComponent::create(name, description);
        let mut tools = self.tools.write().await;
        tools.insert(tool.id, tool.clone());
        Ok(tool)
    }

    async fn get_tool(&self, id: uuid::Uuid) -> Result<Tool> {
        let tools = self.tools.read().await;
        tools
            .get(&id)
            .cloned()
            .ok_or_else(|| crate::error::AgentError::ToolNotFound { tool_name: id.to_string() })
    }

    async fn enable_tool(&self, id: uuid::Uuid) -> Result<Tool> {
        let mut tools = self.tools.write().await;
        if let Some(tool) = tools.get_mut(&id) {
            crate::components::ToolComponent::enable(tool);
            Ok(tool.clone())
        } else {
            Err(crate::error::AgentError::ToolNotFound { tool_name: id.to_string() })
        }
    }

    async fn disable_tool(&self, id: uuid::Uuid) -> Result<Tool> {
        let mut tools = self.tools.write().await;
        if let Some(tool) = tools.get_mut(&id) {
            crate::components::ToolComponent::disable(tool);
            Ok(tool.clone())
        } else {
            Err(crate::error::AgentError::ToolNotFound { tool_name: id.to_string() })
        }
    }

    async fn list_tools(&self) -> Result<Vec<Tool>> {
        let tools = self.tools.read().await;
        Ok(tools.values().cloned().collect())
    }
}

impl Default for InMemoryToolService {
    fn default() -> Self {
        Self::new()
    }
}
