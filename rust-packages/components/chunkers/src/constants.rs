//! Constants for chunking-strategies

/// Default chunk sizes
pub const DEFAULT_CHUNK_SIZE: usize = 512;
pub const DEFAULT_CHUNK_OVERLAP: usize = 50;
pub const DEFAULT_MIN_CHUNK_SIZE: usize = 100;
pub const DEFAULT_MAX_CHUNK_SIZE: usize = 2048;

/// Code-specific chunk sizes
pub const DEFAULT_CODE_CHUNK_SIZE: usize = 1024;
pub const DEFAULT_CODE_CHUNK_OVERLAP: usize = 100;

/// Similarity threshold for semantic chunking
pub const DEFAULT_SIMILARITY_THRESHOLD: f32 = 0.5;

/// Supported languages for code-aware chunking
pub const SUPPORTED_LANGUAGES: &[&str] =
    &["rs", "py", "js", "ts", "java", "go", "cpp", "c", "h", "hpp"];
