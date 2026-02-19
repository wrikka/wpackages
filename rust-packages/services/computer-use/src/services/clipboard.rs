//! Clipboard service trait and implementation

use async_trait::async_trait;
use crate::error::Result;

/// Clipboard service trait
#[async_trait]
pub trait ClipboardService: Send + Sync {
    /// Get clipboard text
    async fn get_text(&self) -> Result<String>;

    /// Set clipboard text
    async fn set_text(&self, text: &str) -> Result<()>;
}

/// Default clipboard service using arboard
pub struct ArboardClipboardService;

impl ArboardClipboardService {
    /// Create new arboard clipboard service
    pub const fn new() -> Self {
        Self
    }
}

impl Default for ArboardClipboardService {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl ClipboardService for ArboardClipboardService {
    async fn get_text(&self) -> Result<String> {
        let mut clipboard = arboard::Clipboard::new()
            .map_err(|e| crate::error::Error::Clipboard(e.to_string()))?;
        clipboard.get_text()
            .map_err(|e| crate::error::Error::Clipboard(e.to_string()))
    }

    async fn set_text(&self, text: &str) -> Result<()> {
        let mut clipboard = arboard::Clipboard::new()
            .map_err(|e| crate::error::Error::Clipboard(e.to_string()))?;
        clipboard.set_text(text)
            .map_err(|e| crate::error::Error::Clipboard(e.to_string()))
    }
}
