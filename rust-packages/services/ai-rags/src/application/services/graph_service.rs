use crate::domain::graph::KnowledgeGraph;
use crate::error::RagResult;
use crate::infrastructure::graph_stores::{GraphStore, InMemoryGraphStore};
use std::sync::Arc;

pub struct GraphService {
    graph_store: Arc<dyn GraphStore>,
}

impl GraphService {
    pub fn new() -> Self {
        Self {
            graph_store: Arc::new(InMemoryGraphStore::new()),
        }
    }

    pub async fn build_graph_from_documents(&self, id: &str, documents: &[crate::domain::Document]) -> RagResult<KnowledgeGraph> {
        // Placeholder for graph building logic
        let graph = KnowledgeGraph::default();
        self.graph_store.set(id, &graph).await?;
        Ok(graph)
    }

    pub async fn get_graph(&self, id: &str) -> RagResult<Option<KnowledgeGraph>> {
        self.graph_store.get(id).await
    }
}
