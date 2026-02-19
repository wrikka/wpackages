//! Constants for Vector Search
//!
//! Contains constant values used throughout the vector search library.

/// Default dimension for vectors (768 is common for sentence transformers)
pub const DEFAULT_DIMENSION: usize = 768;

/// Default top_k for search results
pub const DEFAULT_TOP_K: usize = 10;

/// Default cache capacity
pub const DEFAULT_CACHE_CAPACITY: usize = 1000;

/// Default cache TTL in seconds (1 hour)
pub const DEFAULT_CACHE_TTL_SECS: u64 = 3600;

/// Minimum dimension allowed
pub const MIN_DIMENSION: usize = 1;

/// Maximum dimension allowed (for performance reasons)
pub const MAX_DIMENSION: usize = 4096;

/// Default similarity threshold
pub const DEFAULT_THRESHOLD: f32 = 0.5;

/// Minimum similarity threshold
pub const MIN_THRESHOLD: f32 = 0.0;

/// Maximum similarity threshold
pub const MAX_THRESHOLD: f32 = 1.0;
