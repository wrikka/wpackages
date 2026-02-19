use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Role {
    User,
    Assistant,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub role: Role,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Conversation {
    pub id: String,
    pub messages: Vec<Message>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub mod jobs;
pub mod metrics;
pub mod graph;
pub mod finetuning;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct MetadataFilter {
    pub filters: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Document {
    pub id: String,
    pub content: String,
    pub metadata: Option<serde_json::Value>,
}

impl Document {
    pub fn new(id: impl Into<String>, content: impl Into<String>) -> Self {
        Self {
            id: id.into(),
            content: content.into(),
            metadata: None,
        }
    }

    pub fn with_metadata(mut self, metadata: serde_json::Value) -> Self {
        self.metadata = Some(metadata);
        self
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TextChunk {
    pub id: String,
    pub document_id: String,
    pub text: String,
    pub metadata: Option<serde_json::Value>,
}

impl TextChunk {
    pub fn new(
        id: impl Into<String>,
        document_id: impl Into<String>,
        text: impl Into<String>,
    ) -> Self {
        Self {
            id: id.into(),
            document_id: document_id.into(),
            text: text.into(),
            metadata: None,
        }
    }

    pub fn with_metadata(mut self, metadata: serde_json::Value) -> Self {
        self.metadata = Some(metadata);
        self
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetrievalResult {
    pub chunks: Vec<TextChunk>,
    pub scores: Vec<f32>,
}

impl RetrievalResult {
    pub fn new(chunks: Vec<TextChunk>, scores: Vec<f32>) -> Self {
        Self { chunks, scores }
    }

    pub fn chunk_count(&self) -> usize {
        self.chunks.len()
    }

    pub fn get_best_chunk(&self) -> Option<&TextChunk> {
        self.chunks
            .iter()
            .zip(self.scores.iter())
            .max_by(|a, b| a.1.partial_cmp(b.1).unwrap_or(std::cmp::Ordering::Equal))
            .map(|(chunk, _)| chunk)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RagQuery {
    pub query: String,
    pub documents: Vec<Document>,
    pub options: RagOptions,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RagOptions {
    pub top_k: Option<usize>,
    pub min_similarity: Option<f32>,
    pub include_metadata: bool,
    pub allowed_document_ids: Option<Vec<String>>,
    pub metadata_equals: Option<HashMap<String, String>>,
    pub enable_dedup: bool,
    pub enable_mmr: bool,
    pub mmr_lambda: Option<f32>,
}

impl Default for RagOptions {
    fn default() -> Self {
        Self {
            top_k: None,
            min_similarity: None,
            include_metadata: true,
            allowed_document_ids: None,
            metadata_equals: None,
            enable_dedup: true,
            enable_mmr: false,
            mmr_lambda: Some(0.5),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Citation {
    pub document_id: String,
    pub chunk_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RagResponse {
    pub citations: Vec<Citation>,
    pub answer: String,
    pub context: Vec<TextChunk>,
    pub sources: Vec<String>,
    pub model: String,
}

impl RagResponse {
        pub fn new(answer: impl Into<String>, model: String) -> Self {
        Self {
            answer: answer.into(),
            context: Vec::new(),
            sources: Vec::new(),
            citations: Vec::new(),
            model,
        }
    }

    pub fn with_context(mut self, context: Vec<TextChunk>) -> Self {
        self.context = context;
        self
    }

        pub fn with_sources(mut self, sources: Vec<String>) -> Self {
        self.sources = sources;
        self
    }

    pub fn with_citations(mut self, citations: Vec<Citation>) -> Self {
        self.citations = citations;
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_document() {
        let doc = Document::new("doc1", "This is a document")
            .with_metadata(serde_json::json!({"title": "Test"}));

        assert_eq!(doc.id, "doc1");
        assert_eq!(doc.content, "This is a document");
        assert!(doc.metadata.is_some());
    }

    #[test]
    fn test_text_chunk() {
        let chunk = TextChunk::new("chunk1", "doc1", "This is a chunk")
            .with_metadata(serde_json::json!({"index": 0}));

        assert_eq!(chunk.id, "chunk1");
        assert_eq!(chunk.document_id, "doc1");
        assert_eq!(chunk.text, "This is a chunk");
    }

    #[test]
    fn test_retrieval_result() {
        let chunks = vec![
            TextChunk::new("chunk1", "doc1", "Chunk 1"),
            TextChunk::new("chunk2", "doc1", "Chunk 2"),
        ];
        let scores = vec![0.9, 0.8];

        let result = RetrievalResult::new(chunks, scores);
        assert_eq!(result.chunk_count(), 2);
        assert!(result.get_best_chunk().is_some());
    }
}
