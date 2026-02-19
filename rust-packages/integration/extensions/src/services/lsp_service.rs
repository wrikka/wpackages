//! Language Server Protocol (LSP) service

use crate::error::{AppError, Result};
use crate::types::lsp::{
    CodeLens, Command, CompletionItem, Diagnostic, Hover, LanguageServerConfig, Position,
    SymbolInformation,
};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{debug, error, info, warn};

/// Service for managing language servers
#[derive(Clone)]
pub struct LspService {
    servers: Arc<RwLock<HashMap<String, LanguageServerInstance>>>,
}

struct LanguageServerInstance {
    config: LanguageServerConfig,
    process: Option<tokio::process::Child>,
    initialized: bool,
}

impl LspService {
    /// Creates a new LSP service
    pub fn new() -> Self {
        Self {
            servers: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Registers a language server
    pub async fn register_server(&self, config: LanguageServerConfig) -> Result<()> {
        debug!("Registering language server: {}", config.id);

        let config_id = config.id.clone();
        let mut servers = self.servers.write().await;
        servers.insert(
            config_id.clone(),
            LanguageServerInstance {
                config,
                process: None,
                initialized: false,
            },
        );

        info!("Language server {} registered", config_id);
        Ok(())
    }

    /// Starts a language server
    pub async fn start_server(&self, server_id: &str) -> Result<()> {
        debug!("Starting language server: {}", server_id);

        let mut servers = self.servers.write().await;
        let instance = servers
            .get_mut(server_id)
            .ok_or_else(|| AppError::ServiceError {
                service_name: "LspService".to_string(),
                source: anyhow::anyhow!("Language server {} not found", server_id),
            })?;

        if instance.process.is_some() {
            warn!("Language server {} is already running", server_id);
            return Ok(());
        }

        // Start the language server process
        let mut cmd = tokio::process::Command::new(&instance.config.command);
        cmd.args(&instance.config.args);

        if let Some(ref dir) = instance.config.working_dir {
            cmd.current_dir(dir);
        }

        for (key, value) in &instance.config.env {
            cmd.env(key, value);
        }

        // Set up stdio for LSP communication
        cmd.stdin(std::process::Stdio::piped());
        cmd.stdout(std::process::Stdio::piped());
        cmd.stderr(std::process::Stdio::piped());

        let child = cmd.spawn().map_err(|e| AppError::ServiceError {
            service_name: "LspService".to_string(),
            source: anyhow::anyhow!("Failed to start language server: {}", e),
        })?;

        instance.process = Some(child);
        instance.initialized = false;

        info!("Language server {} started", server_id);
        Ok(())
    }

    /// Stops a language server
    pub async fn stop_server(&self, server_id: &str) -> Result<()> {
        debug!("Stopping language server: {}", server_id);

        let mut servers = self.servers.write().await;
        let instance = servers
            .get_mut(server_id)
            .ok_or_else(|| AppError::ServiceError {
                service_name: "LspService".to_string(),
                source: anyhow::anyhow!("Language server {} not found", server_id),
            })?;

        if let Some(mut child) = instance.process.take() {
            child.kill().await.map_err(|e| AppError::ServiceError {
                service_name: "LspService".to_string(),
                source: anyhow::anyhow!("Failed to stop language server: {}", e),
            })?;
            info!("Language server {} stopped", server_id);
        }

        instance.initialized = false;
        Ok(())
    }

    /// Initializes a language server with LSP initialize request
    pub async fn initialize_server(&self, server_id: &str) -> Result<()> {
        debug!("Initializing language server: {}", server_id);

        let mut servers = self.servers.write().await;
        let instance = servers
            .get_mut(server_id)
            .ok_or_else(|| AppError::ServiceError {
                service_name: "LspService".to_string(),
                source: anyhow::anyhow!("Language server {} not found", server_id),
            })?;

        if instance.initialized {
            debug!("Language server {} already initialized", server_id);
            return Ok(());
        }

        // Send LSP initialize request
        // This is a simplified implementation
        // In a real implementation, you'd need to:
        // 1. Send the initialize request via stdin
        // 2. Wait for the response via stdout
        // 3. Send the initialized notification

        instance.initialized = true;
        info!("Language server {} initialized", server_id);
        Ok(())
    }

    /// Gets diagnostics for a document
    pub async fn get_diagnostics(
        &self,
        server_id: &str,
        document_uri: &str,
    ) -> Result<Vec<Diagnostic>> {
        debug!(
            "Getting diagnostics for {} from {}",
            document_uri, server_id
        );

        let servers = self.servers.read().await;
        let instance = servers
            .get(server_id)
            .ok_or_else(|| AppError::ServiceError {
                service_name: "LspService".to_string(),
                source: anyhow::anyhow!("Language server {} not found", server_id),
            })?;

        if !instance.initialized {
            return Err(AppError::ServiceError {
                service_name: "LspService".to_string(),
                source: anyhow::anyhow!("Language server {} not initialized", server_id),
            });
        }

        // Send textDocument/didOpen notification
        // Send textDocument/publishDiagnostics request
        // This is a simplified implementation

        Ok(Vec::new())
    }

    /// Gets completion items at a position
    pub async fn get_completion(
        &self,
        server_id: &str,
        document_uri: &str,
        position: Position,
    ) -> Result<Vec<CompletionItem>> {
        debug!(
            "Getting completion for {} at {:?} from {}",
            document_uri, position, server_id
        );

        let servers = self.servers.read().await;
        let instance = servers
            .get(server_id)
            .ok_or_else(|| AppError::ServiceError {
                service_name: "LspService".to_string(),
                source: anyhow::anyhow!("Language server {} not found", server_id),
            })?;

        if !instance.initialized {
            return Err(AppError::ServiceError {
                service_name: "LspService".to_string(),
                source: anyhow::anyhow!("Language server {} not initialized", server_id),
            });
        }

        // Send textDocument/completion request
        // This is a simplified implementation

        Ok(Vec::new())
    }

    /// Gets hover information at a position
    pub async fn get_hover(
        &self,
        server_id: &str,
        document_uri: &str,
        position: Position,
    ) -> Result<Option<Hover>> {
        debug!(
            "Getting hover for {} at {:?} from {}",
            document_uri, position, server_id
        );

        let servers = self.servers.read().await;
        let instance = servers
            .get(server_id)
            .ok_or_else(|| AppError::ServiceError {
                service_name: "LspService".to_string(),
                source: anyhow::anyhow!("Language server {} not found", server_id),
            })?;

        if !instance.initialized {
            return Err(AppError::ServiceError {
                service_name: "LspService".to_string(),
                source: anyhow::anyhow!("Language server {} not initialized", server_id),
            });
        }

        // Send textDocument/hover request
        // This is a simplified implementation

        Ok(None)
    }

    /// Gets code lenses for a document
    pub async fn get_code_lenses(
        &self,
        server_id: &str,
        document_uri: &str,
    ) -> Result<Vec<CodeLens>> {
        debug!(
            "Getting code lenses for {} from {}",
            document_uri, server_id
        );

        let servers = self.servers.read().await;
        let instance = servers
            .get(server_id)
            .ok_or_else(|| AppError::ServiceError {
                service_name: "LspService".to_string(),
                source: anyhow::anyhow!("Language server {} not found", server_id),
            })?;

        if !instance.initialized {
            return Err(AppError::ServiceError {
                service_name: "LspService".to_string(),
                source: anyhow::anyhow!("Language server {} not initialized", server_id),
            });
        }

        // Send textDocument/codeLens request
        // This is a simplified implementation

        Ok(Vec::new())
    }

    /// Gets document symbols
    pub async fn get_document_symbols(
        &self,
        server_id: &str,
        document_uri: &str,
    ) -> Result<Vec<SymbolInformation>> {
        debug!(
            "Getting document symbols for {} from {}",
            document_uri, server_id
        );

        let servers = self.servers.read().await;
        let instance = servers
            .get(server_id)
            .ok_or_else(|| AppError::ServiceError {
                service_name: "LspService".to_string(),
                source: anyhow::anyhow!("Language server {} not found", server_id),
            })?;

        if !instance.initialized {
            return Err(AppError::ServiceError {
                service_name: "LspService".to_string(),
                source: anyhow::anyhow!("Language server {} not initialized", server_id),
            });
        }

        // Send textDocument/documentSymbol request
        // This is a simplified implementation

        Ok(Vec::new())
    }

    /// Executes a code lens command
    pub async fn execute_code_lens(&self, command: Command) -> Result<()> {
        debug!("Executing code lens command: {}", command.title);

        // Execute the command
        // This is a simplified implementation

        Ok(())
    }

    /// Gets all registered language servers
    pub async fn get_servers(&self) -> Vec<LanguageServerConfig> {
        let servers = self.servers.read().await;
        servers.values().map(|s| s.config.clone()).collect()
    }

    /// Gets a language server by ID
    pub async fn get_server(&self, server_id: &str) -> Option<LanguageServerConfig> {
        let servers = self.servers.read().await;
        servers.get(server_id).map(|s| s.config.clone())
    }

    /// Checks if a server is running
    pub async fn is_server_running(&self, server_id: &str) -> bool {
        let servers = self.servers.read().await;
        servers
            .get(server_id)
            .map(|s| s.process.is_some())
            .unwrap_or(false)
    }

    /// Stops all language servers
    pub async fn stop_all(&self) {
        debug!("Stopping all language servers");

        let mut servers = self.servers.write().await;
        for (id, instance) in servers.iter_mut() {
            if let Some(mut child) = instance.process.take() {
                if let Err(e) = child.kill().await {
                    error!("Failed to stop language server {}: {}", id, e);
                }
            }
            instance.initialized = false;
        }

        info!("All language servers stopped");
    }
}

impl Default for LspService {
    fn default() -> Self {
        Self::new()
    }
}
