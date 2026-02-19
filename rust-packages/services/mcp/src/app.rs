use crate::components::{ProtocolHandler, LifecycleManager};
use crate::config::McpConfig;
use crate::error::Result;
use crate::types::protocol::{JsonRpcMessage, Request, Response};
use crate::types::capabilities::{ServerCapabilities, ClientCapabilities, ServerInfo};
use std::sync::Arc;

pub struct McpApp {
    config: McpConfig,
    protocol: ProtocolHandler,
    lifecycle: LifecycleManager,
}

impl McpApp {
    pub fn new(config: McpConfig) -> Self {
        let server_info = ServerInfo {
            name: "mcp-rust".to_string(),
            version: env!("CARGO_PKG_VERSION").to_string(),
        };

        let capabilities = ServerCapabilities {
            resources: None,
            tools: None,
            prompts: None,
            logging: None,
            completion: None,
        };

        let lifecycle = LifecycleManager::new(server_info.name, server_info.version)
            .with_capabilities(capabilities);

        Self {
            config,
            protocol: ProtocolHandler::new(),
            lifecycle,
        }
    }

    pub fn config(&self) -> &McpConfig {
        &self.config
    }

    pub fn protocol(&self) -> &ProtocolHandler {
        &self.protocol
    }

    pub fn lifecycle(&self) -> &LifecycleManager {
        &self.lifecycle
    }

    pub fn lifecycle_mut(&mut self) -> &mut LifecycleManager {
        &mut self.lifecycle
    }

    pub async fn handle_message(&mut self, json: &str) -> Result<String> {
        let message = self.protocol.parse_message(json)?;

        match message {
            JsonRpcMessage::Request(request) => {
                let response = self.handle_request(request).await?;
                self.protocol.serialize_message(&JsonRpcMessage::Response(response))
            }
            JsonRpcMessage::Notification(notification) => {
                self.handle_notification(notification).await?;
                Ok(String::new())
            }
            JsonRpcMessage::Response(_) => {
                Err(crate::error::McpError::Protocol("Unexpected response".to_string()))
            }
        }
    }

    async fn handle_request(&mut self, request: Request) -> Result<Response> {
        match request.method.as_str() {
            "initialize" => {
                self.lifecycle.handle_initialize_request(&request)
            }
            "ping" => {
                Ok(Response::success(request.id, serde_json::json!({})))
            }
            _ => {
                if !self.lifecycle.is_initialized() {
                    return Err(crate::error::McpError::Protocol(
                        "Server not initialized".to_string(),
                    ));
                }
                Err(crate::error::McpError::Protocol(format!(
                    "Method not implemented: {}",
                    request.method
                )))
            }
        }
    }

    async fn handle_notification(&mut self, notification: crate::types::protocol::Notification) -> Result<()> {
        match notification.method.as_str() {
            "notifications/initialized" => {
                self.lifecycle.handle_initialized_notification()
            }
            _ => {
                tracing::warn!("Unhandled notification: {}", notification.method);
                Ok(())
            }
        }
    }

    pub fn shutdown(&mut self) {
        self.lifecycle.shutdown();
    }
}

impl Default for McpApp {
    fn default() -> Self {
        Self::new(McpConfig::default())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_app_creation() {
        let app = McpApp::new(McpConfig::default());
        assert_eq!(app.config().server.host, "127.0.0.1");
    }

    #[tokio::test]
    async fn test_handle_ping() {
        let mut app = McpApp::new(McpConfig::default());
        let request = app.protocol().create_request("ping", None);
        let response = app.handle_request(request).await.unwrap();
        assert!(response.result.is_some());
    }
}
