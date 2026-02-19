//! Vision service for OCR and visual search

use async_trait::async_trait;
use std::path::PathBuf;
use crate::error::Result;
use crate::types::Position;

/// Vision service trait
#[async_trait]
pub trait VisionService: Send + Sync {
    /// Perform OCR on screen region
    async fn ocr(&self, x: Option<i32>, y: Option<i32>, width: Option<u32>, height: Option<u32>) -> Result<String>;

    /// Search for image on screen
    async fn visual_search(&self, template_path: &PathBuf) -> Result<Option<Position>>;
}

/// Default vision service (placeholder)
pub struct DefaultVisionService;

impl DefaultVisionService {
    /// Create new vision service
    pub const fn new() -> Self {
        Self
    }
}

impl Default for DefaultVisionService {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl VisionService for DefaultVisionService {
    async fn ocr(&self, _x: Option<i32>, _y: Option<i32>, _width: Option<u32>, _height: Option<u32>) -> Result<String> {
        Ok(String::new())
    }

    async fn visual_search(&self, _template_path: &PathBuf) -> Result<Option<Position>> {
        Ok(None)
    }
}
