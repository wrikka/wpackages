//! Keyboard control service

use async_trait::async_trait;
use crate::error::Result;

/// Keyboard service trait
#[async_trait]
pub trait KeyboardService: Send + Sync {
    /// Type text
    async fn type_text(&self, text: &str) -> Result<()>;

    /// Press a key
    async fn press(&self, key: &str) -> Result<()>;

    /// Key down
    async fn key_down(&self, key: &str) -> Result<()>;

    /// Key up
    async fn key_up(&self, key: &str) -> Result<()>;
}

/// Enigo-based keyboard service
pub struct EnigoKeyboardService {
    enigo: std::sync::Arc<tokio::sync::Mutex<enigo::Enigo>>,
}

impl EnigoKeyboardService {
    /// Create new enigo keyboard service
    pub fn new() -> Result<Self> {
        let enigo = enigo::Enigo::new(&enigo::Settings::default())
            .map_err(|e| crate::error::Error::KeyboardControl(e.to_string()))?;
        Ok(Self {
            enigo: std::sync::Arc::new(tokio::sync::Mutex::new(enigo)),
        })
    }
}

impl Default for EnigoKeyboardService {
    fn default() -> Self {
        Self::new().expect("Failed to create EnigoKeyboardService")
    }
}

#[async_trait]
impl KeyboardService for EnigoKeyboardService {
    async fn type_text(&self, text: &str) -> Result<()> {
        let mut enigo = self.enigo.lock().await;
        enigo.text(text)
            .map_err(|e| crate::error::Error::KeyboardControl(e.to_string()))?;
        Ok(())
    }

    async fn press(&self, _key: &str) -> Result<()> {
        Ok(())
    }

    async fn key_down(&self, _key: &str) -> Result<()> {
        Ok(())
    }

    async fn key_up(&self, _key: &str) -> Result<()> {
        Ok(())
    }
}
