use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Metrics {
    pub retrieval_precision: f32,
    pub answer_relevance: f32,
}
