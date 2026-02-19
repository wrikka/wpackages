use std::sync::Arc;
use tokio::sync::{mpsc, RwLock};
use serde::{Deserialize, Serialize};
use tracing::{debug, warn};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum MessageDirection {
    ClientToServer,
    ServerToClient,
    Bidirectional,
}

#[derive(Debug, Clone)]
pub struct ChannelConfig {
    pub buffer_size: usize,
    pub max_message_size: usize,
}

impl Default for ChannelConfig {
    fn default() -> Self {
        Self {
            buffer_size: 1000,
            max_message_size: 10 * 1024 * 1024, // 10MB
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BidirectionalMessage {
    pub id: String,
    pub direction: MessageDirection,
    pub payload: serde_json::Value,
    pub timestamp: i64,
}

pub struct BidirectionalChannel {
    config: ChannelConfig,
    client_to_server_tx: mpsc::Sender<BidirectionalMessage>,
    client_to_server_rx: Arc<RwLock<Option<mpsc::Receiver<BidirectionalMessage>>>>,
    server_to_client_tx: mpsc::Sender<BidirectionalMessage>,
    server_to_client_rx: Arc<RwLock<Option<mpsc::Receiver<BidirectionalMessage>>>>,
}

impl BidirectionalChannel {
    pub fn new(config: ChannelConfig) -> Self {
        let (client_to_server_tx, client_to_server_rx) = mpsc::channel(config.buffer_size);
        let (server_to_client_tx, server_to_client_rx) = mpsc::channel(config.buffer_size);

        Self {
            config,
            client_to_server_tx,
            client_to_server_rx: Arc::new(RwLock::new(Some(client_to_server_rx))),
            server_to_client_tx,
            server_to_client_rx: Arc::new(RwLock::new(Some(server_to_client_rx))),
        }
    }

    pub async fn send_to_server(&self, message: BidirectionalMessage) -> Result<(), String> {
        self.client_to_server_tx
            .send(message)
            .await
            .map_err(|e| format!("Failed to send to server: {}", e))
    }

    pub async fn send_to_client(&self, message: BidirectionalMessage) -> Result<(), String> {
        self.server_to_client_tx
            .send(message)
            .await
            .map_err(|e| format!("Failed to send to client: {}", e))
    }

    pub async fn receive_from_server(&mut self) -> Option<BidirectionalMessage> {
        let mut rx = self.server_to_client_rx.write().await;
        if let Some(ref mut receiver) = *rx {
            receiver.recv().await
        } else {
            None
        }
    }

    pub async fn receive_from_client(&mut self) -> Option<BidirectionalMessage> {
        let mut rx = self.client_to_server_rx.write().await;
        if let Some(ref mut receiver) = *rx {
            receiver.recv().await
        } else {
            None
        }
    }

    pub fn client_sender(&self) -> mpsc::Sender<BidirectionalMessage> {
        self.client_to_server_tx.clone()
    }

    pub fn server_sender(&self) -> mpsc::Sender<BidirectionalMessage> {
        self.server_to_client_tx.clone()
    }
}
