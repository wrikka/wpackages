//! types/consolidation.rs

use serde::{Deserialize, Serialize};

/// Represents a piece of consolidated knowledge derived from multiple agents' memories.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsolidatedInsight {
    pub insight: String,
    pub supporting_memories: Vec<String>, // IDs of memories that contributed to this insight
}
