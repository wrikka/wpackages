use crate::error::Result;
use crate::types::protocol::Request;

pub struct McpServer {
    host: String,
    port: u16,
}

impl McpServer {
    pub fn new(host: String, port: u16) -> Self {
        Self { host, port }
    }

    pub async fn start(&self) -> Result<()> {
        Ok(())
    }

    pub async fn handle(&self, _message: Request) -> Result<serde_json::Value> {
        Ok(serde_json::json!({ "result": "handled" }))
    }
}
