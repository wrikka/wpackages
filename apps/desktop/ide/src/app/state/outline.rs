use crate::error::EditorError;
use lsp_types::{DocumentSymbol, Position, Url};
use outline::{OutlineClient, OutlineKind};
use std::sync::Arc;
use tokio::sync::Mutex;
use tracing::{debug, info, warn};

pub struct OutlineState {
    client: Arc<Mutex<OutlineClientImpl>>,
    enabled: Arc<Mutex<bool>>,
}

impl OutlineState {
    pub fn new() -> Self {
        Self {
            client: Arc::new(Mutex::new(OutlineClientImpl::new())),
            enabled: Arc::new(Mutex::new(true)),
        }
    }

    pub async fn get_outline(&self, uri: Url) -> Result<Option<outline::OutlineView>, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.get_outline(uri).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn update_outline(
        &self,
        uri: Url,
        symbols: Vec<DocumentSymbol>,
    ) -> Result<(), EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.update_outline(uri, symbols).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn find_item_at_position(
        &self,
        uri: Url,
        position: Position,
    ) -> Result<Option<outline::OutlineItem>, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.find_item_at_position(uri, position).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn filter_by_kind(
        &self,
        uri: Url,
        kind: OutlineKind,
    ) -> Result<Vec<outline::OutlineItem>, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.filter_by_kind(uri, kind).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn filter_by_name(
        &self,
        uri: Url,
        query: &str,
    ) -> Result<Vec<outline::OutlineItem>, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.filter_by_name(uri, query).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn toggle_item(&self, uri: Url, name: &str) -> Result<Option<()>, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.toggle_item(uri, name).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn expand_all(&self, uri: Url) -> Result<(), EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.expand_all(uri).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn collapse_all(&self, uri: Url) -> Result<(), EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.collapse_all(uri).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn get_all_outlines(&self) -> Result<outline::Outline, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.get_all_outlines().await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn clear(&self) -> Result<(), EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.clear().await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn is_enabled(&self) -> Result<bool, EditorError> {
        let enabled = self.enabled.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        Ok(*enabled)
    }

    pub async fn set_enabled(&self, enabled: bool) -> Result<(), EditorError> {
        let mut en = self.enabled.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        *en = enabled;
        Ok(())
    }
}

impl Default for OutlineState {
    fn default() -> Self {
        Self::new()
    }
}
