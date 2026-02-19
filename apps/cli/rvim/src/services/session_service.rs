use crate::app::App;
use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Serialize, Deserialize)]
struct SerializableAppState {
    // Add fields from App that you want to save
    // For example:
    // open_files: Vec<String>,
}

pub struct SessionService;

impl SessionService {
    pub fn save_session(app: &App, path: &Path) -> Result<()> {
        let state = SerializableAppState {
            // Populate from app state
        };
        let serialized = serde_json::to_string(&state)?;
        fs::write(path, serialized)?;
        Ok(())
    }

    pub fn load_session(path: &Path) -> Result<SerializableAppState> {
        let serialized = fs::read_to_string(path)?;
        let state: SerializableAppState = serde_json::from_str(&serialized)?;
        Ok(state)
    }
}
