//! Constants for the RAG service

/// Default chunk size
pub const DEFAULT_CHUNK_SIZE: usize = 512;

/// Default chunk overlap
pub const DEFAULT_CHUNK_OVERLAP: usize = 50;

/// Default top-k for retrieval
pub const DEFAULT_TOP_K: usize = 5;

/// Default minimum similarity threshold
pub const DEFAULT_MIN_SIMILARITY: f32 = 0.7;

/// Maximum document size in characters
pub const MAX_DOCUMENT_SIZE: usize = 10_000_000;

/// Maximum chunk size
pub const MAX_CHUNK_SIZE: usize = 4096;

/// Default embedding dimension
pub const DEFAULT_EMBEDDING_DIM: usize = 768;
