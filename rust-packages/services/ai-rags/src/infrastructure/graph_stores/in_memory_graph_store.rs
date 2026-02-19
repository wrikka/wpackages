use super::GraphStore;
use crate::domain::graph::KnowledgeGraph;
use crate::error::RagResult;
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Default)]
pub struct InMemoryGraphStore {
    graphs: Arc<RwLock<HashMap<String, KnowledgeGraph>>>,
}

impl InMemoryGraphStore {
    pub fn new() -> Self {
        Self::default()
    }
}

#[async_trait]
impl GraphStore for InMemoryGraphStore {
    async fn get(&self, id: &str) -> RagResult<Option<KnowledgeGraph>> {
        let graphs = self.graphs.read().await;
        Ok(graphs.get(id).cloned())
    }

    async fn set(&self, id: &str, graph: &KnowledgeGraph) -> RagResult<()> {
        let mut graphs = self.graphs.write().await;
        graphs.insert(id.to_string(), graph.clone());
        Ok(())
    }
}
