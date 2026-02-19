use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ElementFinderRequest {
    pub query: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FoundElement {
    pub ref_id: String,
    pub score: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ElementFinderResponse {
    pub elements: Vec<FoundElement>,
}
