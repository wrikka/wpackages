use crate::error::{AppError, Result};
use crate::types::SessionState;
use std::path::PathBuf;
use tokio::fs;

const SESSION_FILE: &str = "session.json";

#[derive(Clone)]
pub struct SessionService;

impl SessionService {
    pub fn new() -> Self {
        Self
    }

    fn get_session_path() -> Result<PathBuf> {
        let mut path = std::env::current_dir()
            .map_err(|e| AppError::io("getting current directory", e))?;
        path.push(SESSION_FILE);
        Ok(path)
    }

    pub async fn save_session(&self, state: &SessionState) -> Result<()> {
        let path = Self::get_session_path()?;
        let data = serde_json::to_string_pretty(state)
            .map_err(|e| AppError::Serialization(e))?;
        fs::write(&path, data.as_bytes())
            .await
            .map_err(|e| AppError::io(format!("writing session file: {:?}", path), e))?;
        Ok(())
    }

    pub async fn load_session(&self) -> Result<Option<SessionState>> {
        let path = Self::get_session_path()?;
        if !path.exists() {
            return Ok(None);
        }
        let json = fs::read_to_string(&path)
            .await
            .map_err(|e| AppError::io(format!("reading session file: {:?}", path), e))?;
        let state = serde_json::from_str(&json)
            .map_err(|e| AppError::Serialization(e))?;
        Ok(Some(state))
    }
}

impl Default for SessionService {
    fn default() -> Self {
        Self::new()
    }
}
