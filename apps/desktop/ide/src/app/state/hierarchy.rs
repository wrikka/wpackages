use crate::error::EditorError;
use crate::services::hierarchy::{HierarchyClient, HierarchyClientImpl, HierarchyDirection, HierarchyTree};
use lsp_types::{DocumentSymbol, Position, Url};
use std::sync::Arc;
use tokio::sync::Mutex;
use tracing::{debug, info, warn};

pub struct HierarchyState {
    client: Arc<Mutex<HierarchyClientImpl>>,
}

impl HierarchyState {
    pub fn new() -> Self {
        Self {
            client: Arc::new(Mutex::new(HierarchyClientImpl::new())),
        }
    }

    pub async fn type_hierarchy(
        &self,
        uri: Url,
        position: Position,
        direction: HierarchyDirection,
    ) -> Result<Vec<lsp_types::TypeHierarchyItem>, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.type_hierarchy(uri, position, direction).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn call_hierarchy(
        &self,
        uri: Url,
        position: Position,
        direction: HierarchyDirection,
    ) -> Result<Vec<lsp_types::CallHierarchyItem>, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.call_hierarchy(uri, position, direction).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn get_hierarchy_tree(
        &self,
        uri: Url,
        position: Position,
    ) -> Result<HierarchyTree, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.get_hierarchy_tree(uri, position).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn update_hierarchy(
        &self,
        uri: Url,
        symbols: Vec<DocumentSymbol>,
    ) -> Result<(), EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.update_hierarchy(uri, symbols).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn clear(&self) -> Result<(), EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.clear().await.map_err(|e| EditorError::Other(e.to_string()))
    }
}

impl Default for HierarchyState {
    fn default() -> Self {
        Self::new()
    }
}
