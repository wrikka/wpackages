use super::DocumentStore;
use crate::domain::Document;
use crate::error::RagResult;
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Default)]
pub struct InMemoryDocumentStore {
    documents: Arc<RwLock<HashMap<String, Document>>>,
}

impl InMemoryDocumentStore {
    pub fn new() -> Self {
        Self::default()
    }
}

#[async_trait]
impl DocumentStore for InMemoryDocumentStore {
    async fn get(&self, id: &str) -> RagResult<Option<Document>> {
        let documents = self.documents.read().await;
        Ok(documents.get(id).cloned())
    }

    async fn set(&self, document: &Document) -> RagResult<()> {
        let mut documents = self.documents.write().await;
        documents.insert(document.id.clone(), document.clone());
        Ok(())
    }

    async fn delete(&self, id: &str) -> RagResult<()> {
        let mut documents = self.documents.write().await;
        documents.remove(id);
        Ok(())
    }

    async fn list(&self) -> RagResult<Vec<Document>> {
        let documents = self.documents.read().await;
        Ok(documents.values().cloned().collect())
    }
}
