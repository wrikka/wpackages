//! Enigo adapter for desktop automation

use crate::error::{Error, Result};
use crate::types::Position;

/// Enigo adapter wrapper
pub struct EnigoAdapter {
    inner: enigo::Enigo,
}

impl EnigoAdapter {
    /// Create new enigo adapter
    pub fn new() -> Result<Self> {
        let enigo = enigo::Enigo::new(&enigo::Settings::default())
            .map_err(|e| Error::Automation(e.to_string()))?;
        Ok(Self { inner: enigo })
    }

    /// Move mouse to absolute position
    pub fn move_mouse(&mut self, x: i32, y: i32) -> Result<()> {
        self.inner
            .move_mouse(x, y, enigo::Coordinate::Abs)
            .map_err(|e| Error::MouseControl(e.to_string()))
    }

    /// Click left mouse button
    pub fn click(&mut self) -> Result<()> {
        self.inner
            .button(enigo::Button::Left, enigo::Direction::Click)
            .map_err(|e| Error::MouseControl(e.to_string()))
    }

    /// Right click
    pub fn right_click(&mut self) -> Result<()> {
        self.inner
            .button(enigo::Button::Right, enigo::Direction::Click)
            .map_err(|e| Error::MouseControl(e.to_string()))
    }

    /// Double click
    pub fn double_click(&mut self) -> Result<()> {
        self.inner
            .button(enigo::Button::Left, enigo::Direction::Double)
            .map_err(|e| Error::MouseControl(e.to_string()))
    }

    /// Type text
    pub fn type_text(&mut self, text: &str) -> Result<()> {
        self.inner
            .text(text)
            .map_err(|e| Error::KeyboardControl(e.to_string()))
    }
}

impl Default for EnigoAdapter {
    fn default() -> Self {
        Self::new().expect("Failed to create EnigoAdapter")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_enigo_adapter_creation() {
        let adapter = EnigoAdapter::new();
        assert!(adapter.is_ok());
    }
}
