use crate::error::EditorError;
use minimap::{Minimap, MinimapConfig, MinimapHighlight, HighlightKind};
use std::sync::Arc;
use tokio::sync::Mutex;
use tracing::{debug, info, warn};

pub struct MinimapState {
    minimap: Arc<Mutex<Minimap>>,
    enabled: Arc<Mutex<bool>>,
}

impl MinimapState {
    pub fn new() -> Self {
        Self {
            minimap: Arc::new(Mutex::new(Minimap::new(MinimapConfig::new()))),
            enabled: Arc::new(Mutex::new(true)),
        }
    }

    pub async fn update(&self, text: String) -> Result<(), EditorError> {
        let mut minimap = self.minimap.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        minimap.update(text);
        Ok(())
    }

    pub async fn set_current_line(&self, line: usize) -> Result<(), EditorError> {
        let mut minimap = self.minimap.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        minimap.set_current_line(line);
        Ok(())
    }

    pub async fn set_visible_range(&self, start: usize, end: usize) -> Result<(), EditorError> {
        let mut minimap = self.minimap.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        minimap.set_visible_range(start, end);
        Ok(())
    }

    pub async fn add_highlight(&self, highlight: MinimapHighlight) -> Result<(), EditorError> {
        let mut minimap = self.minimap.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        minimap.add_highlight(highlight);
        Ok(())
    }

    pub async fn clear_highlights(&self) -> Result<(), EditorError> {
        let mut minimap = self.minimap.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        minimap.clear_highlights();
        Ok(())
    }

    pub async fn get_height(&self) -> Result<f32, EditorError> {
        let minimap = self.minimap.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        Ok(minimap.height())
    }

    pub async fn visible_ratio(&self) -> Result<f32, EditorError> {
        let minimap = self.minimap.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        Ok(minimap.visible_ratio())
    }

    pub async fn visible_position(&self) -> Result<f32, EditorError> {
        let minimap = self.minimap.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        Ok(minimap.visible_position())
    }

    pub async fn current_line_position(&self) -> Result<f32, EditorError> {
        let minimap = self.minimap.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        Ok(minimap.current_line_position())
    }

    pub async fn line_from_position(&self, position: f32) -> Result<usize, EditorError> {
        let minimap = self.minimap.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        Ok(minimap.line_from_position(position))
    }

    pub async fn position_from_line(&self, line: usize) -> Result<f32, EditorError> {
        let minimap = self.minimap.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        Ok(minimap.position_from_line(line))
    }

    pub async fn is_line_visible(&self, line: usize) -> Result<bool, EditorError> {
        let minimap = self.minimap.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        Ok(minimap.is_line_visible(line))
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

    pub async fn get_config(&self) -> Result<MinimapConfig, EditorError> {
        let minimap = self.minimap.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        Ok(minimap.config().clone())
    }

    pub async fn set_config(&self, config: MinimapConfig) -> Result<(), EditorError> {
        let mut minimap = self.minimap.lock().map_err(|e| EditorError::Other(e.to_string()))?;
        *minimap = Minimap::new(config);
        Ok(())
    }
}

impl Default for MinimapState {
    fn default() -> Self {
        Self::new()
    }
}
