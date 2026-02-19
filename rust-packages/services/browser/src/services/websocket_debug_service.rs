use crate::error::Result;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebSocketMessage {
    pub direction: WebSocketDirection,
    pub payload: String,
    pub opcode: u8,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WebSocketDirection {
    Sent,
    Received,
}

#[async_trait]
pub trait WebSocketDebugService: Send + Sync {
    async fn get_messages(&self, session_id: &str) -> Result<Vec<WebSocketMessage>>;
    async fn send_message(&self, session_id: &str, payload: &str) -> Result<()>;
    async fn clear_messages(&self, session_id: &str) -> Result<()>;
}
