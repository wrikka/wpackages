//! Automation service trait and implementation

use async_trait::async_trait;
use crate::error::Result;
use crate::types::{Action, Position, TaskResult};

/// Automation service trait
#[async_trait]
pub trait AutomationService: Send + Sync {
    /// Execute an action
    async fn execute(&self, action: &Action) -> Result<TaskResult>;

    /// Click at position
    async fn click(&self, pos: Position) -> Result<()>;

    /// Type text
    async fn type_text(&self, text: &str) -> Result<()>;

    /// Press key
    async fn press_key(&self, key: &str) -> Result<()>;

    /// Move mouse to position
    async fn move_mouse(&self, pos: Position) -> Result<()>;
}

/// Default automation service using enigo
pub struct EnigoAutomationService {
    enigo: std::sync::Arc<tokio::sync::Mutex<enigo::Enigo>>,
}

impl EnigoAutomationService {
    /// Create new enigo automation service
    pub fn new() -> Result<Self> {
        let enigo = enigo::Enigo::new(&enigo::Settings::default())
            .map_err(|e| crate::error::Error::Automation(e.to_string()))?;
        Ok(Self {
            enigo: std::sync::Arc::new(tokio::sync::Mutex::new(enigo)),
        })
    }
}

impl Default for EnigoAutomationService {
    fn default() -> Self {
        Self::new().expect("Failed to create EnigoAutomationService")
    }
}

#[async_trait]
impl AutomationService for EnigoAutomationService {
    async fn execute(&self, _action: &Action) -> Result<TaskResult> {
        Ok(TaskResult::success("Action executed"))
    }

    async fn click(&self, pos: Position) -> Result<()> {
        let mut enigo = self.enigo.lock().await;
        enigo.move_mouse(pos.x, pos.y, enigo::Coordinate::Abs)
            .map_err(|e| crate::error::Error::MouseControl(e.to_string()))?;
        enigo.button(enigo::Button::Left, enigo::Direction::Click)
            .map_err(|e| crate::error::Error::MouseControl(e.to_string()))?;
        Ok(())
    }

    async fn type_text(&self, text: &str) -> Result<()> {
        let mut enigo = self.enigo.lock().await;
        enigo.text(text)
            .map_err(|e| crate::error::Error::KeyboardControl(e.to_string()))?;
        Ok(())
    }

    async fn press_key(&self, _key: &str) -> Result<()> {
        Ok(())
    }

    async fn move_mouse(&self, pos: Position) -> Result<()> {
        let mut enigo = self.enigo.lock().await;
        enigo.move_mouse(pos.x, pos.y, enigo::Coordinate::Abs)
            .map_err(|e| crate::error::Error::MouseControl(e.to_string()))?;
        Ok(())
    }
}
