// Common types for AI Suite
use serde::{Deserialize, Serialize};

/// Embedding vector
pub type Embedding = Vec<f32>;

/// Document ID
pub type DocumentId = String;

/// Similarity score
pub type SimilarityScore = f32;

/// Text chunk
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TextChunk {
    pub id: DocumentId,
    pub text: String,
    pub metadata: Option<serde_json::Value>,
}

/// Search result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub chunk: TextChunk,
    pub score: SimilarityScore,
}
