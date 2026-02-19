use crate::error::EditorError;
use navigation::{NavigationClient, NavigationTarget, NavigationOptions};
use lsp_types::{Position, Url};
use std::sync::Arc;
use tokio::sync::Mutex;
use tracing::{debug, info, warn};

pub struct NavigationState {
    client: Arc<Mutex<NavigationClientImpl>>,
}

impl NavigationState {
    pub fn new() -> Self {
        Self {
            client: Arc::new(Mutex::new(NavigationClientImpl::new())),
        }
    }

    pub async fn goto_definition(
        &self,
        uri: Url,
        position: Position,
    ) -> Result<Option<lsp_types::GotoDefinitionResponse>, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.goto_definition(uri, position).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn goto_type_definition(
        &self,
        uri: Url,
        position: Position,
    ) -> Result<Option<lsp_types::GotoTypeDefinitionResponse>, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.goto_type_definition(uri, position).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn goto_implementation(
        &self,
        uri: Url,
        position: Position,
    ) -> Result<Option<lsp_types::GotoImplementationResponse>, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.goto_implementation(uri, position).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn find_references(
        &self,
        uri: Url,
        position: Position,
        options: lsp_types::ReferenceOptions,
    ) -> Result<Vec<lsp_types::Location>, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.find_references(uri, position, options).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn document_symbols(
        &self,
        uri: Url,
    ) -> Result<Option<lsp_types::DocumentSymbolResponse>, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.document_symbols(uri).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn workspace_symbols(
        &self,
        query: &str,
    ) -> Result<Vec<lsp_types::SymbolInformation>, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.workspace_symbols(query).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn navigate_to(&self, target: NavigationTarget) -> Result<(), EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.navigate_to(target).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn go_back(&self) -> Result<Option<navigation::NavigationHistoryEntry>, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.go_back().await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn go_forward(&self) -> Result<Option<navigation::NavigationHistoryEntry>, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.go_forward().await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn can_go_back(&self) -> Result<bool, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.get_history().await.map(|h| h.can_go_back()).map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn can_go_forward(&self) -> Result<bool, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.get_history().await.map(|h| h.can_go_forward()).map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn add_bookmark(&self, name: String, target: NavigationTarget) -> Result<(), EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.add_bookmark(name, target).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn remove_bookmark(&self, name: String) -> Result<Option<NavigationTarget>, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.remove_bookmark(name).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn get_bookmarks(&self) -> Result<navigation::NavigationBookmarks, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.get_bookmarks().await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn search_symbols(
        &self,
        query: &str,
        scope: navigation::SymbolScope,
        options: NavigationOptions,
    ) -> Result<navigation::SymbolSearchResult, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.search_symbols(query, scope, options).await.map_err(|e| EditorError::Other(e.to_string()))
    }
}

impl Default for NavigationState {
    fn default() -> Self {
        Self::new()
    }
}
