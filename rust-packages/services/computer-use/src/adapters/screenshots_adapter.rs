//! Screenshots adapter for screen capture

use crate::error::{Error, Result};
use crate::types::ScreenInfo;

/// Screenshots adapter wrapper
pub struct ScreenshotsAdapter;

impl ScreenshotsAdapter {
    /// Create new screenshots adapter
    pub const fn new() -> Self {
        Self
    }

    /// Get all screens
    pub fn screens() -> Result<Vec<ScreenInfo>> {
        let screens = screenshots::Screen::all()
            .map_err(|e| Error::Screenshot(e.to_string()))?;

        Ok(screens
            .iter()
            .enumerate()
            .map(|(i, s)| ScreenInfo {
                index: i as u32,
                x: s.display_info.x,
                y: s.display_info.y,
                width: s.display_info.width,
                height: s.display_info.height,
                is_primary: i == 0,
            })
            .collect())
    }

    /// Capture screen by index
    pub fn capture_screen(index: u32) -> Result<Vec<u8>> {
        let screens = screenshots::Screen::all()
            .map_err(|e| Error::Screenshot(e.to_string()))?;

        let screen = screens
            .get(index as usize)
            .ok_or_else(|| Error::Screenshot(format!("Screen {} not found", index)))?;

        let image = screen
            .capture()
            .map_err(|e| Error::Screenshot(e.to_string()))?;

        let mut buffer = Vec::new();
        image
            .write_to(&mut std::io::Cursor::new(&mut buffer), image::ImageFormat::Png)
            .map_err(|e| Error::Screenshot(e.to_string()))?;

        Ok(buffer)
    }

    /// Capture screen region
    pub fn capture_region(x: i32, y: i32, width: u32, height: u32) -> Result<Vec<u8>> {
        let screens = screenshots::Screen::all()
            .map_err(|e| Error::Screenshot(e.to_string()))?;

        let screen = screens.first()
            .ok_or_else(|| Error::Screenshot("No screen found".to_string()))?;

        let image = screen
            .capture_area(x, y, width, height)
            .map_err(|e| Error::Screenshot(e.to_string()))?;

        let mut buffer = Vec::new();
        image
            .write_to(&mut std::io::Cursor::new(&mut buffer), image::ImageFormat::Png)
            .map_err(|e| Error::Screenshot(e.to_string()))?;

        Ok(buffer)
    }
}

impl Default for ScreenshotsAdapter {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_screenshots_adapter_screens() {
        let screens = ScreenshotsAdapter::screens();
        assert!(screens.is_ok());
    }
}
