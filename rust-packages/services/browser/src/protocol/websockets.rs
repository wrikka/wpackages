use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum FrameType {
    Sent,
    Received,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WebSocketFrame {
    pub frame_type: FrameType,
    pub opcode: f64,
    pub mask: bool,
    pub payload_data: String,
    pub timestamp: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WebSocketFramesResponse {
    pub frames: Vec<WebSocketFrame>,
}
