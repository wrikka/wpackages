use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub index: u32,
    pub score: f32,
    pub metadata: serde_json::Value,
}
