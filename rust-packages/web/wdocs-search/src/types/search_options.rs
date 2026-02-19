use serde::{Deserialize, Serialize};
use rustc_hash::FxHashMap;

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SearchOptions {
    pub limit: Option<u32>,
    pub offset: Option<u32>,
    pub field_weights: Option<HashMap<String, f64>>,
    pub fuzzy: Option<bool>,
    pub fuzzy_threshold: Option<u32>,
    pub highlight: Option<bool>,
    pub include_scores: Option<bool>,
}

#[derive(Debug, Clone)]
pub struct SearchResult {
    pub documents: Vec<crate::types::document::Document>,
    pub scores: Vec<f64>,
    pub total_hits: u32,
}

#[derive(Debug, Clone)]
pub struct IndexStats {
    pub num_documents: u32,
    pub num_tokens: u32,
    pub memory_usage_bytes: u32,
}
