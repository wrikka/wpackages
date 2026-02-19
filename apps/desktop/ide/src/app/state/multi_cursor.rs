use crate::error::EditorError;
use multi_cursor::{CursorManager, CursorPosition, CursorOperation, MultiCursorOperations};
use std::sync::Arc;
use tokio::sync::Mutex;
use tracing::{debug, info, warn};

pub struct MultiCursorState {
    ops: Arc<Mutex<MultiCursorOperations>>,
    enabled: Arc<Mutex<bool>>,
}

impl MultiCursorState {
    pub fn new() -> Self {
        Self {
            ops: Arc::new(Mutex::new(MultiCursorOperations::new())),
            enabled: Arc::new(Mutex::new(true)),
        }
    }

    pub async fn add_cursor(&self, position: CursorPosition) -> Result<(), EditorError> {
        let mut ops = self.ops.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        ops.add_cursor(position);
        Ok(())
    }

    pub async fn remove_cursor_at(&self, position: CursorPosition) -> Result<(), EditorError> {
        let mut ops = self.ops.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        ops.remove_cursor_at(position)?;
        Ok(())
    }

    pub async fn cursor_count(&self) -> Result<usize, EditorError> {
        let ops = self.ops.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        Ok(ops.cursor_count())
    }

    pub async fn has_cursors(&self) -> Result<bool, EditorError> {
        let ops = self.ops.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        Ok(ops.has_cursors())
    }

    pub async fn clear_cursors(&self) -> Result<(), EditorError> {
        let mut ops = self.ops.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        ops.clear();
        Ok(())
    }

    pub async fn execute(&self, operation: CursorOperation) -> Result<(), EditorError> {
        let mut ops = self.ops.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        ops.execute(operation)?;
        Ok(())
    }

    pub async fn cursor_positions(&self) -> Result<Vec<CursorPosition>, EditorError> {
        let ops = self.ops.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        Ok(ops.cursor_positions())
    }

    pub async fn selections(&self) -> Result<Vec<multi_cursor::Selection>, EditorError> {
        let ops = self.ops.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        Ok(ops.selections())
    }

    pub async fn selected_text(&self, text: &str) -> Result<Vec<String>, EditorError> {
        let ops = self.ops.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        Ok(ops.selected_text(text))
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

impl Default for MultiCursorState {
    fn default() -> Self {
        Self::new()
    }
}
