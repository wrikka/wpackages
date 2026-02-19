//! Logic for memory consolidation and abstraction.

use crate::models::{MemoryContent, Embedding, Emotion};

/// A function signature for a summarizer.
/// Takes a slice of memory contents and returns a new, summarized content and its embedding.
pub type Summarizer = fn(&[MemoryContent]) -> (MemoryContent, Embedding, Option<Emotion>);
