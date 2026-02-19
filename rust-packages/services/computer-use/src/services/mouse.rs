//! Mouse control service

use async_trait::async_trait;
use crate::error::Result;
use crate::types::Position;

/// Mouse service trait
#[async_trait]
pub trait MouseService: Send + Sync {
    /// Move mouse to position
    async fn move_to(&self, pos: Position) -> Result<()>;

    /// Click at current position
    async fn click(&self) -> Result<()>;

    /// Right click at current position
    async fn right_click(&self) -> Result<()>;

    /// Double click at current position
    async fn double_click(&self) -> Result<()>;

    /// Scroll
    async fn scroll(&self, amount: i32) -> Result<()>;

    /// Get current position
    async fn get_position(&self) -> Result<Position>;
}

/// Enigo-based mouse service
pub struct EnigoMouseService {
    enigo: std::sync::Arc<tokio::sync::Mutex<enigo::Enigo>>,
}

impl EnigoMouseService {
    /// Create new enigo mouse service
    pub fn new() -> Result<Self> {
        let enigo = enigo::Enigo::new(&enigo::Settings::default())
            .map_err(|e| crate::error::Error::MouseControl(e.to_string()))?;
        Ok(Self {
            enigo: std::sync::Arc::new(tokio::sync::Mutex::new(enigo)),
        })
    }
}

impl Default for EnigoMouseService {
    fn default() -> Self {
        Self::new().expect("Failed to create EnigoMouseService")
    }
}

#[async_trait]
impl MouseService for EnigoMouseService {
    async fn move_to(&self, pos: Position) -> Result<()> {
        let mut enigo = self.enigo.lock().await;
        enigo.move_mouse(pos.x, pos.y, enigo::Coordinate::Abs)
            .map_err(|e| crate::error::Error::MouseControl(e.to_string()))?;
        Ok(())
    }

    async fn click(&self) -> Result<()> {
        let mut enigo = self.enigo.lock().await;
        enigo.button(enigo::Button::Left, enigo::Direction::Click)
            .map_err(|e| crate::error::Error::MouseControl(e.to_string()))?;
        Ok(())
    }

    async fn right_click(&self) -> Result<()> {
        let mut enigo = self.enigo.lock().await;
        enigo.button(enigo::Button::Right, enigo::Direction::Click)
            .map_err(|e| crate::error::Error::MouseControl(e.to_string()))?;
        Ok(())
    }

    async fn double_click(&self) -> Result<()> {
        let mut enigo = self.enigo.lock().await;
        enigo.button(enigo::Button::Left, enigo::Direction::Double)
            .map_err(|e| crate::error::Error::MouseControl(e.to_string()))?;
        Ok(())
    }

    async fn scroll(&self, _amount: i32) -> Result<()> {
        Ok(())
    }

    async fn get_position(&self) -> Result<Position> {
        Ok(Position::zero())
    }
}
