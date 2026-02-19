use crate::error::{AppError, Result};
use crate::types::{Command, Keybinding, Theme, TriggerSpec};
use figment::{
    providers::{Env, Format, Toml},
    Figment,
};
use serde::Deserialize;
use std::path::PathBuf;

#[derive(Deserialize, Debug, Default, Clone)]
pub struct AppConfig {
    pub log_level: Option<String>,
    pub enable_ligatures: Option<bool>,
    pub copy_on_select: Option<bool>,
    pub keybindings: Option<Vec<Keybinding>>,
    pub theme: Option<Theme>,
    pub commands: Option<Vec<Command>>,
    pub triggers: Option<Vec<TriggerSpec>>,
}

impl AppConfig {
    /// Load configuration from Config.toml and environment variables
    pub fn load() -> Result<Self> {
        Figment::new()
            .merge(Toml::file("Config.toml").nested())
            .merge(Env::prefixed("WPTY_").split("__"))
            .extract()
            .map_err(|e| AppError::Config(e))
    }

    /// Load configuration from a specific path
    pub fn load_from_path(path: impl Into<PathBuf>) -> Result<Self> {
        let path: PathBuf = path.into();
        Figment::new()
            .merge(Toml::file(path).nested())
            .merge(Env::prefixed("WPTY_").split("__"))
            .extract()
            .map_err(|e| AppError::Config(e))
    }

    /// Get the default config file path
    pub fn get_config_path() -> Result<PathBuf> {
        let mut path = std::env::current_dir()
            .map_err(|e| AppError::io("getting current directory", e))?;
        path.push("Config.toml");
        Ok(path)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = AppConfig::default();
        assert!(config.log_level.is_none());
        assert!(config.enable_ligatures.is_none());
    }
}
