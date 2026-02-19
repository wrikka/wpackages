//! # LSP Client State
//!
//! LSP client state management.

mod document;
mod navigation;
mod editing;
mod completion;

use crate::error::EditorError;
use lsp_client::{LspClient, LspConfig};
use lsp_types::Url;
use std::sync::{Arc, Mutex};
use tracing::info;

pub struct LspClientState {
    client: Arc<Mutex<Option<LspClient>>>,
    initialized: Arc<Mutex<bool>>,
    server_capabilities: Arc<Mutex<Option<lsp_types::ServerCapabilities>>>,
}

impl LspClientState {
    pub fn new() -> Self {
        Self {
            client: Arc::new(Mutex::new(None)),
            initialized: Arc::new(Mutex::new(false)),
            server_capabilities: Arc::new(Mutex::new(None)),
        }
    }

    pub async fn initialize(&self, config: LspConfig) -> Result<(), EditorError> {
        let mut client_guard = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;

        if client_guard.is_some() {
            return Err(EditorError::Other("LSP client already initialized".to_string()));
        }

        // Create LSP client
        let mut client = lsp_client::create_stdio_client(&mut std::process::Command::new(&config.server_command))?;
        client.start().await.map_err(|e| EditorError::Other(e.to_string()))?;

        // Initialize
        let init_result = client.initialize(config).await.map_err(|e| EditorError::Other(e.to_string()))?;

        // Store capabilities
        let mut caps_guard = self.server_capabilities.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        *caps_guard = Some(init_result.capabilities);

        // Store client
        *client_guard = Some(client);

        // Mark as initialized
        let mut init_guard = self.initialized.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        *init_guard = true;

        info!("LSP client initialized successfully");

        Ok(())
    }

    pub async fn shutdown(&self) -> Result<(), EditorError> {
        let mut client_guard = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;

        if let Some(mut client) = client_guard.take() {
            client.shutdown().await.map_err(|e| EditorError::Other(e.to_string()))?;
            client.exit().await.map_err(|e| EditorError::Other(e.to_string()))?;
        }

        let mut init_guard = self.initialized.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        *init_guard = false;

        info!("LSP client shut down");

        Ok(())
    }

    pub async fn is_initialized(&self) -> Result<bool, EditorError> {
        let init_guard = self.initialized.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        Ok(*init_guard)
    }

    pub async fn get_client(&self) -> Result<Option<lsp_client::LspClientImpl>, EditorError> {
        let client_guard = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        Ok(client_guard.as_ref().map(|c| c.clone()))
    }

    pub async fn get_capabilities(&self) -> Result<Option<lsp_types::ServerCapabilities>, EditorError> {
        let caps_guard = self.server_capabilities.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        Ok(caps_guard.clone())
    }
}

impl Default for LspClientState {
    fn default() -> Self {
        Self::new()
    }
}
