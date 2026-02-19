use crate::error::EditorError;
use code_folding::{CodeFolding, FoldingManager, FoldingRegionKind};
use lsp_types::Url;
use std::sync::Arc;
use tokio::sync::Mutex;
use tracing::{debug, info, warn};

pub struct CodeFoldingState {
    manager: Arc<Mutex<FoldingManager>>,
    enabled: Arc<Mutex<bool>>,
}

impl CodeFoldingState {
    pub fn new() -> Self {
        Self {
            manager: Arc::new(Mutex::new(FoldingManager::new())),
            enabled: Arc::new(Mutex::new(true)),
        }
    }

    pub async fn update(&self, text: &str, language_id: &str) -> Result<(), EditorError> {
        let mut manager = self.manager.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        manager.update(text, language_id).map_err(|e| EditorError::Other(e.to_string()))?;
        Ok(())
    }

    pub async fn fold_all(&self) -> Result<(), EditorError> {
        let mut manager = self.manager.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        manager.fold_all();
        Ok(())
    }

    pub async fn expand_all(&self) -> Result<(), EditorError> {
        let mut manager = self.manager.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        manager.expand_all();
        Ok(())
    }

    pub async fn toggle_at(&self, line: usize, column: usize) -> Result<(), EditorError> {
        let mut manager = self.manager.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        manager.toggle_at(line, column).map_err(|e| EditorError::Other(e.to_string()))?;
        Ok(())
    }

    pub async fn get_regions(&self) -> Result<Vec<FoldingRegion>, EditorError> {
        let manager = self.manager.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        Ok(manager.regions().clone())
    }

    pub async fn get_hidden_lines(&self) -> Result<Vec<usize>, EditorError> {
        let manager = self.manager.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        Ok(manager.hidden_lines())
    }

    pub async fn is_line_hidden(&self, line: usize) -> Result<bool, EditorError> {
        let manager = self.manager.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        Ok(manager.is_line_hidden(line))
    }

    pub async fn visible_line_count(&self, total_lines: usize) -> Result<usize, EditorError> {
        let manager = self.manager.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        Ok(manager.visible_line_count(total_lines))
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

impl Default for CodeFoldingState {
    fn default() -> Self {
        Self::new()
    }
}
