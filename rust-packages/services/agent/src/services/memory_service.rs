//! services/memory_service.rs

use crate::Result;
use ai_memories::{Memory, MemoryContent, MemorySystem, MemorySystemConfig};
use async_trait::async_trait;
use std::sync::Arc;
use uuid::Uuid;

/// A service that provides an interface to the `ai-memories` system.
#[derive(Clone)]
pub struct MemoryService {
    system: Arc<MemorySystem>,
}

impl MemoryService {
    /// Creates a new `MemoryService` with a default `MemorySystem`.
    pub fn new() -> Self {
        let config = MemorySystemConfig::default();
        let system = MemorySystem::new(config).expect("Failed to create memory system");
        Self { system: Arc::new(system) }
    }
}

#[async_trait]
pub trait IMemoryService: Send + Sync {
    async fn add_memory(&self, content: String) -> Result<()>;
    async fn search_memories(&self, query: &str) -> Result<Vec<Memory>>;
}

#[async_trait]
impl IMemoryService for MemoryService {
    async fn add_memory(&self, content: String) -> Result<()> {
        let memory = Memory::new(MemoryContent::Text(content), None, None, None);
        self.system.add_memory(memory).await?;
        Ok(())
    }

    async fn search_memories(&self, query: &str) -> Result<Vec<Memory>> {
        let results = self.system.search(query, 10, 0.5).await?;
        Ok(results)
    }
}

impl Default for MemoryService {
    fn default() -> Self {
        Self::new()
    }
}
