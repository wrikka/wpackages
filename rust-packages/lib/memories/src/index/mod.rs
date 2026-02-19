//! Defines the trait for vector indexing and searching.

use std::collections::HashSet;
use crate::models::{Embedding, MemoryId};

pub mod lsh_index;

/// A trait for any vector index implementation.
/// This allows for different indexing strategies (e.g., LSH, HNSW) to be used interchangeably.
pub trait VectorIndex {
    /// Adds a vector with its corresponding ID to the index.
    fn add(&mut self, id: MemoryId, vec: &Embedding);

    /// Queries the index to find candidate nearest neighbors for a given vector.
    fn query(&self, vec: &Embedding) -> HashSet<MemoryId>;
}
