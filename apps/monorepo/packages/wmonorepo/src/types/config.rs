use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct TaskConfig {
    #[serde(default)]
    pub outputs: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct WmoRepoConfig {
    #[serde(default)]
    pub remote_cache_url: Option<String>,
    pub workspaces: Vec<String>,
    #[serde(default)]
    pub pipeline: HashMap<String, TaskConfig>,
}

use crate::error::AppResult;

impl WmoRepoConfig {
    pub fn load() -> AppResult<Self> {
                let config_str = std::fs::read_to_string("wmo.config.json")?;
        let config: WmoRepoConfig = serde_json::from_str(&config_str)?;
        Ok(config)
    }
}
