use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct RequestKey {
    pub identifier: String,
    pub endpoint: String,
}

impl RequestKey {
    pub fn new(identifier: impl Into<String>, endpoint: impl Into<String>) -> Self {
        Self {
            identifier: identifier.into(),
            endpoint: endpoint.into(),
        }
    }

    pub fn to_string(&self) -> String {
        format!("{}:{}", self.identifier, self.endpoint)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimitResult {
    pub allowed: bool,
    pub remaining: u32,
    pub reset_at: Option<u64>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct RateLimitStatus {
    pub requests_made: u32,
    pub window_start: u64,
}
