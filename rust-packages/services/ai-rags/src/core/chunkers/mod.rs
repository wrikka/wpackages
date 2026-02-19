use crate::domain::{Document, TextChunk};
use crate::error::RagResult;
pub mod semantic_chunker;
pub mod simple_chunker;

use async_trait::async_trait;
pub use semantic_chunker::SemanticChunker;
pub use simple_chunker::SimpleChunker;

#[async_trait]
pub trait Chunker: Send + Sync {
    async fn chunk_document(&self, document: &Document) -> RagResult<Vec<TextChunk>>;
    async fn chunk_documents(&self, documents: &[Document]) -> RagResult<Vec<TextChunk>> {
        let mut all_chunks = Vec::new();
        for document in documents {
            let chunks = self.chunk_document(document).await?;
            all_chunks.extend(chunks);
        }
        Ok(all_chunks)
    }
}
