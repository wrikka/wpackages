use serde::{Deserialize, Serialize};

use super::types::AppConfig;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigProfile {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub config: AppConfig,
    pub is_default: bool,
}

impl ConfigProfile {
    pub fn new(name: String, config: AppConfig) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            description: None,
            config,
            is_default: false,
        }
    }

    pub fn with_description(mut self, description: String) -> Self {
        self.description = Some(description);
        self
    }

    pub fn save_to_path(&self, path: &std::path::Path) -> Result<(), super::error::ConfigError> {
        self.config.save_to_path(path, super::types::ConfigFormat::Toml)
    }
}
