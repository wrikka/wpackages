use crate::application::services::rag_service::RagService;
use crate::domain::Document;
use crate::error::RagResult;
use crate::infrastructure::document_stores::{DocumentStore, InMemoryDocumentStore};
use std::sync::Arc;

pub struct DocumentService {
    rag_service: Arc<RagService>,
    document_store: Arc<dyn DocumentStore>,
}

impl DocumentService {
    pub fn new(rag_service: Arc<RagService>) -> Self {
        Self {
            rag_service,
            document_store: Arc::new(InMemoryDocumentStore::new()),
        }
    }

    pub async fn add_document(&self, path: &str) -> RagResult<Vec<Document>> {
        let documents = self.rag_service.add_document(path).await?;
        for doc in &documents {
            self.document_store.set(doc).await?;
        }
        Ok(documents)
    }

    pub async fn get_document(&self, id: &str) -> RagResult<Option<Document>> {
        self.document_store.get(id).await
    }

    pub async fn delete_document(&self, id: &str) -> RagResult<()> {
        self.document_store.delete(id).await
    }

    pub async fn list_documents(&self) -> RagResult<Vec<Document>> {
        self.document_store.list().await
    }
}
