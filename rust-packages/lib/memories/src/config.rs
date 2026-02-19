//! Configuration for the MemorySystem.

#[derive(Debug, Clone)]
pub struct MemorySystemConfig {
    pub consolidation_threshold: f32,
    pub w_similarity: f32,
    pub w_graph: f32,
    pub graph_boost: f32,
}

impl Default for MemorySystemConfig {
    fn default() -> Self {
        Self {
            consolidation_threshold: 0.85,
            w_similarity: 0.8,
            w_graph: 0.2,
            graph_boost: 0.2,
        }
    }
}
