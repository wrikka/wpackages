//! Vision utilities for screen capture and image processing
//!
//! Note: OCR and visual search features are currently disabled due to
//! system library dependencies (tesseract, opencv).

use anyhow::{anyhow, Result};

#[derive(Debug, serde::Serialize)]
pub struct Rect {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}

/// Read text from screen using OCR
/// Note: Currently returns placeholder text as tesseract is disabled
pub fn read_text_from_screen(_roi: Option<Rect>) -> Result<String> {
    // Placeholder implementation - tesseract requires system libraries
    Ok("OCR disabled - tesseract not available".to_string())
}

/// Find image on screen using template matching
/// Note: Currently returns error as opencv is disabled
pub fn find_image_on_screen(_template_path: &str) -> Result<Rect> {
    // Placeholder implementation - opencv requires system libraries
    Err(anyhow!("Visual search disabled - opencv not available"))
}
