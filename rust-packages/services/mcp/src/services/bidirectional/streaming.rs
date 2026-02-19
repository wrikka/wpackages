use std::sync::Arc;
use std::time::Duration;
use tokio::sync::{mpsc, RwLock};
use serde::{Deserialize, Serialize};
use tracing::{debug, warn};

#[derive(Debug, Clone)]
pub struct StreamConfig {
    pub buffer_size: usize,
    pub heartbeat_interval: Duration,
    pub timeout: Duration,
}

impl Default for StreamConfig {
    fn default() -> Self {
        Self {
            buffer_size: 1000,
            heartbeat_interval: Duration::from_secs(30),
            timeout: Duration::from_secs(60),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamMessage {
    pub message_type: StreamMessageType,
    pub payload: serde_json::Value,
    pub sequence: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StreamMessageType {
    Data,
    Heartbeat,
    Error,
    Close,
}

pub struct EventStream {
    config: StreamConfig,
    sender: mpsc::Sender<StreamMessage>,
    receiver: Arc<RwLock<Option<mpsc::Receiver<StreamMessage>>>>,
    sequence: Arc<RwLock<u64>>,
}

impl EventStream {
    pub fn new(config: StreamConfig) -> Self {
        let (sender, receiver) = mpsc::channel(config.buffer_size);

        Self {
            config,
            sender,
            receiver: Arc::new(RwLock::new(Some(receiver))),
            sequence: Arc::new(RwLock::new(0)),
        }
    }

    pub async fn send(&self, payload: serde_json::Value) -> Result<(), String> {
        let mut seq = self.sequence.write().await;
        *seq += 1;
        let sequence = *seq;
        drop(seq);

        let message = StreamMessage {
            message_type: StreamMessageType::Data,
            payload,
            sequence,
        };

        self.sender
            .send(message)
            .await
            .map_err(|e| format!("Failed to send message: {}", e))
    }

    pub async fn send_heartbeat(&self) -> Result<(), String> {
        let mut seq = self.sequence.write().await;
        *seq += 1;
        let sequence = *seq;
        drop(seq);

        let message = StreamMessage {
            message_type: StreamMessageType::Heartbeat,
            payload: serde_json::json!({}),
            sequence,
        };

        self.sender
            .send(message)
            .await
            .map_err(|e| format!("Failed to send heartbeat: {}", e))
    }

    pub async fn send_error(&self, error: String) -> Result<(), String> {
        let mut seq = self.sequence.write().await;
        *seq += 1;
        let sequence = *seq;
        drop(seq);

        let message = StreamMessage {
            message_type: StreamMessageType::Error,
            payload: serde_json::json!({ "error": error }),
            sequence,
        };

        self.sender
            .send(message)
            .await
            .map_err(|e| format!("Failed to send error: {}", e))
    }

    pub async fn close(&self) -> Result<(), String> {
        let message = StreamMessage {
            message_type: StreamMessageType::Close,
            payload: serde_json::json!({}),
            sequence: 0,
        };

        self.sender
            .send(message)
            .await
            .map_err(|e| format!("Failed to send close: {}", e))
    }

    pub async fn recv(&mut self) -> Option<StreamMessage> {
        let mut rx = self.receiver.write().await;
        if let Some(ref mut receiver) = *rx {
            receiver.recv().await
        } else {
            None
        }
    }

    pub fn sender(&self) -> mpsc::Sender<StreamMessage> {
        self.sender.clone()
    }
}
