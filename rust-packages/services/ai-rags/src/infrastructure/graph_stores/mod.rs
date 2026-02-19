use crate::domain::graph::KnowledgeGraph;
use crate::error::RagResult;
use async_trait::async_trait;

#[async_trait]
pub trait GraphStore: Send + Sync {
    async fn get(&self, id: &str) -> RagResult<Option<KnowledgeGraph>>;
    async fn set(&self, id: &str, graph: &KnowledgeGraph) -> RagResult<()>;
}

pub mod in_memory_graph_store;

pub use in_memory_graph_store::InMemoryGraphStore;
