use serde::{Deserialize, Serialize};

/// A single chunk of text
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Chunk {
    pub id: String,
    pub content: String,
    pub start_index: usize,
    pub end_index: usize,
    pub metadata: ChunkMetadata,
}

/// Metadata for a chunk
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChunkMetadata {
    pub strategy: ChunkingStrategy,
    pub language: Option<String>,
    pub token_count: usize,
    pub char_count: usize,
    pub overlap: usize,
}

/// Available chunking strategies
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ChunkingStrategy {
    Recursive,
    Semantic,
    CodeAware,
}

/// Configuration for chunking operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChunkingConfig {
    pub chunk_size: usize,
    pub chunk_overlap: usize,
    pub min_chunk_size: usize,
    pub max_chunk_size: usize,
    pub separators: Vec<String>,
}

impl Default for ChunkingConfig {
    fn default() -> Self {
        Self {
            chunk_size: 512,
            chunk_overlap: 50,
            min_chunk_size: 100,
            max_chunk_size: 2048,
            separators: vec![
                "\n\n".to_string(),
                "\n".to_string(),
                ". ".to_string(),
                "! ".to_string(),
                "? ".to_string(),
                "; ".to_string(),
                ", ".to_string(),
                " ".to_string(),
            ],
        }
    }
}

/// Output from a chunking operation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChunkOutput {
    pub chunks: Vec<Chunk>,
    pub total_chunks: usize,
    pub total_tokens: usize,
    pub strategy: ChunkingStrategy,
}

/// Trait for chunking implementations
pub trait Chunker {
    /// Chunk the given text
    fn chunk(&self, text: &str) -> crate::error::ChunkingResult<ChunkOutput>;

    /// Get the strategy name
    fn strategy(&self) -> ChunkingStrategy;
}
