use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InterceptedRequest {
    pub url: String,
    pub method: String,
    pub headers: serde_json::Value,
    pub post_data: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NetworkResponse {
    pub requests: Vec<InterceptedRequest>,
}
