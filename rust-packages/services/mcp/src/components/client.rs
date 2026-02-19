use crate::error::Result;
use crate::types::protocol::Request;

pub struct McpClient {
    endpoint: String,
}

impl McpClient {
    pub fn new(endpoint: String) -> Self {
        Self { endpoint }
    }

    pub async fn send(&self, _message: &Request) -> Result<serde_json::Value> {
        Ok(serde_json::json!({ "status": "sent" }))
    }
}
