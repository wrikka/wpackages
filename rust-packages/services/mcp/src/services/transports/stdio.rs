use crate::error::{McpError, Result};
use std::io::Write;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader as AsyncBufReader};
use tokio::sync::mpsc;

pub struct StdioTransport {
    sender: mpsc::UnboundedSender<String>,
    receiver: mpsc::UnboundedReceiver<String>,
}

impl StdioTransport {
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

impl Default for StdioTransport {
    fn default() -> Self {
        Self::new()
    }
}

pub async fn run_stdio_transport(mut transport: StdioTransport) -> Result<()> {
    let stdin = tokio::io::stdin();
    let mut stdout = tokio::io::stdout();
    let mut reader = AsyncBufReader::new(stdin).lines();

    loop {
        match reader.next_line().await {
            Ok(Some(line)) => {
                if let Err(e) = transport.send_message(line) {
                    tracing::error!("Error sending message: {}", e);
                    return Err(e);
                }
            }
            Ok(None) => {
                return Err(McpError::Connection("Stdin closed".to_string()));
            }
            Err(e) => {
                return Err(McpError::Connection(format!("Failed to read stdin: {}", e)));
            }
        }

        while let Ok(message) = transport.read_message().await {
            if let Err(e) = stdout.write_all(message.as_bytes()).await {
                tracing::error!("Error writing to stdout: {}", e);
                return Err(McpError::Connection(format!("Failed to write stdout: {}", e)));
            }
            if let Err(e) = stdout.write_all(b"\n").await {
                tracing::error!("Error writing newline: {}", e);
                return Err(McpError::Connection(format!("Failed to write newline: {}", e)));
            }
            if let Err(e) = stdout.flush().await {
                tracing::error!("Error flushing stdout: {}", e);
                return Err(McpError::Connection(format!("Failed to flush stdout: {}", e)));
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_stdio_transport_creation() {
        let transport = StdioTransport::new();
        assert!(transport.sender().is_closed() == false);
    }
}
