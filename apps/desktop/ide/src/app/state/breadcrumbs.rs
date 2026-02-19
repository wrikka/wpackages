use crate::error::EditorError;
use breadcrumbs::{BreadcrumbClient, BreadcrumbConfig, BreadcrumbPath, BreadcrumbKind};
use lsp_types::{DocumentSymbol, Position, Url};
use std::sync::Arc;
use tokio::sync::Mutex;
use tracing::{debug, info, warn};

pub struct BreadcrumbsState {
    client: Arc<Mutex<BreadcrumbClientImpl>>,
    config: Arc<Mutex<BreadcrumbConfig>>,
    paths: Arc<Mutex<std::collections::HashMap<Url, BreadcrumbPath>>>,
}

impl BreadcrumbsState {
    pub fn new() -> Self {
        Self {
            client: Arc::new(Mutex::new(BreadcrumbClientImpl::new())),
            config: Arc::new(Mutex::new(BreadcrumbConfig::new())),
            paths: Arc::new(Mutex::new(std::collections::HashMap::new())),
        }
    }

    pub async fn get_breadcrumbs(
        &self,
        uri: Url,
        position: Position,
    ) -> Result<BreadcrumbPath, EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.get_breadcrumbs(uri, position).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn update_breadcrumbs(
        &self,
        uri: Url,
        symbols: Vec<DocumentSymbol>,
    ) -> Result<(), EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.update_breadcrumbs(uri, symbols).await.map_err(|e| EditorError::Other(e.to_string()))?;

        // Cache the path
        let path = client.get_breadcrumbs(uri, Position::new(0, 0)).await?;
        let mut paths = self.paths.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        paths.insert(uri, path);

        Ok(())
    }

    pub async fn clear_cache(&self) -> Result<(), EditorError> {
        let client = self.client.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        client.clear_cache().await.map_err(|e| EditorError::Other(e.to_string()))?;

        let mut paths = self.paths.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        paths.clear();

        Ok(())
    }

    pub async fn get_config(&self) -> Result<BreadcrumbConfig, EditorError> {
        let config = self.config.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        Ok(config.clone())
    }

    pub async fn set_config(&self, config: BreadcrumbConfig) -> Result<(), EditorError> {
        let mut cfg = self.config.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        *cfg = config;
        Ok(())
    }

    pub async fn get_cached_path(&self, uri: &Url) -> Option<BreadcrumbPath> {
        let paths = self.paths.lock().ok()?;
        paths.get(uri).cloned()
    }

    pub async fn cache_path(&self, uri: Url, path: BreadcrumbPath) {
        if let Ok(mut paths) = self.paths.lock() {
            paths.insert(uri, path);
        }
    }
}

impl Default for BreadcrumbsState {
    fn default() -> Self {
        Self::new()
    }
}
