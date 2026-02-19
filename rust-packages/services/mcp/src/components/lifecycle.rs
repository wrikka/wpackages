use crate::error::{McpError, Result};
use crate::types::protocol::{Id, JsonRpcMessage, Request, Response};
use crate::types::capabilities::{
    InitializeParams, InitializeResult,
    ServerCapabilities, ClientCapabilities, ServerInfo, ClientInfo,
};
use serde_json::json;

#[derive(Debug, Clone, PartialEq)]
pub enum LifecycleState {
    Uninitialized,
    Initializing,
    Initialized,
    ShuttingDown,
    Shutdown,
}

pub struct LifecycleManager {
    state: LifecycleState,
    server_info: ServerInfo,
    server_capabilities: ServerCapabilities,
}

impl LifecycleManager {
    pub fn new(server_name: impl Into<String>, server_version: impl Into<String>) -> Self {
        Self {
            state: LifecycleState::Uninitialized,
            server_info: ServerInfo {
                name: server_name.into(),
                version: server_version.into(),
            },
            server_capabilities: ServerCapabilities {
                resources: None,
                tools: None,
                prompts: None,
                logging: None,
                completion: None,
            },
        }
    }

    pub fn with_capabilities(mut self, capabilities: ServerCapabilities) -> Self {
        self.server_capabilities = capabilities;
        self
    }

    pub fn state(&self) -> &LifecycleState {
        &self.state
    }

    pub fn is_initialized(&self) -> bool {
        self.state == LifecycleState::Initialized
    }

    pub fn handle_initialize_request(&mut self, request: &Request) -> Result<Response> {
        if self.state != LifecycleState::Uninitialized {
            return Err(McpError::Protocol(
                "Server already initialized".to_string(),
            ));
        }

        let params: InitializeParams = serde_json::from_value(
            request.params
                .as_ref()
                .ok_or_else(|| McpError::Protocol("Missing initialize params".to_string()))?
                .clone()
        ).map_err(|e| McpError::Protocol(format!("Invalid initialize params: {}", e)))?;

        tracing::info!("Initialize request from client: {} v{}", 
            params.client_info.name, params.client_info.version);

        let result = InitializeResult {
            protocol_version: "2025-11-25".to_string(),
            capabilities: self.server_capabilities.clone(),
            server_info: self.server_info.clone(),
            instructions: None,
        };

        self.state = LifecycleState::Initializing;

        Ok(Response::success(request.id.clone(), json!(result)))
    }

    pub fn handle_initialized_notification(&mut self) -> Result<()> {
        if self.state != LifecycleState::Initializing {
            return Err(McpError::Protocol(
                "Not in initializing state".to_string(),
            ));
        }

        tracing::info!("Client initialized");
        self.state = LifecycleState::Initialized;

        Ok(())
    }

    pub fn create_initialize_request(&self, client_info: ClientInfo, capabilities: ClientCapabilities) -> Request {
        Request {
            jsonrpc: "2.0".to_string(),
            id: Id::Num(1),
            method: "initialize".to_string(),
            params: Some(json!(InitializeParams {
                protocol_version: "2025-11-25".to_string(),
                capabilities,
                client_info,
            })),
        }
    }

    pub fn create_initialized_notification(&self) -> JsonRpcMessage {
        JsonRpcMessage::Notification(crate::types::protocol::Notification {
            jsonrpc: "2.0".to_string(),
            method: "notifications/initialized".to_string(),
            params: None,
        })
    }

    pub fn shutdown(&mut self) {
        if self.state == LifecycleState::Initialized {
            self.state = LifecycleState::ShuttingDown;
            tracing::info!("Shutting down MCP connection");
        }
    }

    pub fn set_shutdown(&mut self) {
        self.state = LifecycleState::Shutdown;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_lifecycle_state_transitions() {
        let mut manager = LifecycleManager::new("test", "1.0.0");

        assert_eq!(manager.state(), &LifecycleState::Uninitialized);

        let request = Request {
            jsonrpc: "2.0".to_string(),
            id: Id::Num(1),
            method: "initialize".to_string(),
            params: Some(json!(InitializeParams {
                protocol_version: "2025-11-25".to_string(),
                capabilities: ClientCapabilities {
                    experimental: None,
                    sampling: None,
                },
                client_info: ClientInfo {
                    name: "test-client".to_string(),
                    version: "1.0.0".to_string(),
                },
            })),
        };

        let response = manager.handle_initialize_request(&request).unwrap();
        assert_eq!(manager.state(), &LifecycleState::Initializing);
        assert!(response.result.is_some());

        manager.handle_initialized_notification().unwrap();
        assert_eq!(manager.state(), &LifecycleState::Initialized);
        assert!(manager.is_initialized());

        manager.shutdown();
        assert_eq!(manager.state(), &LifecycleState::ShuttingDown);
    }

    #[test]
    fn test_double_initialize_fails() {
        let mut manager = LifecycleManager::new("test", "1.0.0");

        let request = Request {
            jsonrpc: "2.0".to_string(),
            id: Id::Num(1),
            method: "initialize".to_string(),
            params: Some(json!(InitializeParams {
                protocol_version: "2025-11-25".to_string(),
                capabilities: ClientCapabilities {
                    experimental: None,
                    sampling: None,
                },
                client_info: ClientInfo {
                    name: "test-client".to_string(),
                    version: "1.0.0".to_string(),
                },
            })),
        };

        manager.handle_initialize_request(&request).unwrap();
        manager.handle_initialized_notification().unwrap();

        let result = manager.handle_initialize_request(&request);
        assert!(result.is_err());
    }
}
