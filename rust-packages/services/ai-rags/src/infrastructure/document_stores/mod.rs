use crate::domain::Document;
use crate::error::RagResult;
use async_trait::async_trait;

#[async_trait]
pub trait DocumentStore: Send + Sync {
    async fn get(&self, id: &str) -> RagResult<Option<Document>>;
    async fn set(&self, document: &Document) -> RagResult<()>;
    async fn delete(&self, id: &str) -> RagResult<()>;
    async fn list(&self) -> RagResult<Vec<Document>>;
}

pub mod in_memory_document_store;

pub use in_memory_document_store::InMemoryDocumentStore;
