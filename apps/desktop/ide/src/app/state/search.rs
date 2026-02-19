use crate::error::EditorError;
use lsp_types::Url;
use search::{SearchClient, SearchOptions, SearchResult as SearchResults};
use std::path::Path;
use std::sync::Arc;
use tokio::sync::Mutex;
use tracing::{debug, info, warn};

pub struct SearchState {
    client: Arc<Mutex<SearchClientImpl>>,
    enabled: Arc<Mutex<bool>>,
}

impl SearchState {
    pub fn new() -> Self {
        Self {
            client: Arc::new(Mutex::new(SearchClientImpl::new())),
            enabled: Arc::new(Mutex::new(true)),
        }
    }

    pub async fn search(
        &self,
        pattern: &str,
        directory: &Path,
        options: SearchOptions,
    ) -> Result<SearchResults, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.search(pattern, directory, options).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn search_file(
        &self,
        pattern: &str,
        file_path: &Path,
        options: SearchOptions,
    ) -> Result<SearchResults, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.search_file(pattern, file_path, options).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn replace(
        &self,
        pattern: &str,
        replacement: &str,
        directory: &Path,
        options: SearchOptions,
    ) -> Result<search::ReplaceResult, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.replace(pattern, replacement, directory, options).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn replace_file(
        &self,
        pattern: &str,
        replacement: &str,
        file_path: &Path,
        options: SearchOptions,
    ) -> Result<search::ReplaceResult, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.replace_file(pattern, replacement, file_path, options).await.map_err(|e| EditorError::Other(e.to_string()))
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

impl Default for SearchState {
    fn default() -> Self {
        Self::new()
    }
}
