use crate::error::{McpError, Result};
use futures_util::stream::StreamExt;
use tokio::sync::mpsc;
use tokio_tungstenite::tungstenite::Message;

pub struct WebSocketTransport {
    sender: mpsc::UnboundedSender<String>,
    receiver: mpsc::UnboundedReceiver<String>,
}

impl WebSocketTransport {
    pub fn new() -> Self {
        let (sender, receiver) = mpsc::unbounded_channel();
        Self { sender, receiver }
    }

    pub fn sender(&self) -> mpsc::UnboundedSender<String> {
        self.sender.clone()
    }

    pub async fn read_message(&mut self) -> Result<String> {
        self.receiver
            .recv()
            .await
            .ok_or_else(|| McpError::Connection("Transport closed".to_string()))
    }

    pub fn send_message(&self, message: String) -> Result<()> {
        self.sender
            .send(message)
            .map_err(|e| McpError::Connection(format!("Failed to send message: {}", e)))
    }
}

impl Default for WebSocketTransport {
    fn default() -> Self {
        Self::new()
    }
}

pub async fn handle_websocket_connection(
    ws_stream: tokio_tungstenite::WebSocketStream<tokio::net::TcpStream>,
    mut transport: WebSocketTransport,
) -> Result<()> {
    let (mut write, mut read) = ws_stream.split();

    loop {
        tokio::select! {
            msg = read.next() => {
                match msg {
                    Some(Ok(Message::Text(text))) => {
                        if let Err(e) = transport.send_message(text.to_string()) {
                            tracing::error!("Error sending message: {}", e);
                            return Err(e);
                        }
                    }
                    Some(Ok(Message::Close(_))) => {
                        return Err(McpError::Connection("WebSocket closed".to_string()));
                    }
                    Some(Err(e)) => {
                        return Err(McpError::Connection(format!("WebSocket error: {}", e)));
                    }
                    None => {
                        return Err(McpError::Connection("WebSocket stream ended".to_string()));
                    }
                    _ => {}
                }
            }
            msg = transport.read_message() => {
                match msg {
                    Ok(text) => {
                        if let Err(e) = write.send(Message::Text(text.to_string())).await {
                            tracing::error!("Error writing to WebSocket: {}", e);
                            return Err(McpError::Connection(format!("Failed to write WebSocket: {}", e)));
                        }
                    }
                    Err(e) => {
                        return Err(e);
                    }
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_websocket_transport_creation() {
        let transport = WebSocketTransport::new();
        assert!(transport.sender().is_closed() == false);
    }
}
