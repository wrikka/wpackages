//! Configuration Management
//! 
//! Central configuration structure and loading logic for the WAI IDE

use figment::{Figment, providers::{Env, Format, Toml}};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

use crate::error::ConfigError;
use crate::types::*;

/// Main application configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub app: ApplicationConfig,
    pub window: WindowConfig,
    pub appearance: AppearanceConfig,
    pub terminal: TerminalConfig,
    pub editor: EditorConfig,
    pub keybindings: KeyBindingsConfig,
    pub plugins: PluginsConfig,
    pub logging: LoggingConfig,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            app: ApplicationConfig::default(),
            window: WindowConfig::default(),
            appearance: AppearanceConfig::default(),
            terminal: TerminalConfig::default(),
            editor: EditorConfig::default(),
            keybindings: KeyBindingsConfig::default(),
            plugins: PluginsConfig::default(),
            logging: LoggingConfig::default(),
        }
    }
}

impl AppConfig {
    /// Load configuration from file and environment variables
    pub fn load() -> Result<Self, ConfigError> {
        let config_path = std::env::var("WAI_CONFIG_PATH")
            .unwrap_or_else(|_| "Config.toml".to_string());

        let figment = Figment::new()
            .merge(Toml::file(config_path))
            .merge(Env::prefixed("WAI_"))
            .merge(Self::default());

        figment.extract()
            .map_err(ConfigError::FigmentError)
    }

    /// Save configuration to file
    pub fn save(&self, path: &PathBuf) -> Result<(), ConfigError> {
        let content = toml::to_string_pretty(self)
            .map_err(|e| ConfigError::ParseError(e.to_string()))?;
        
        std::fs::write(path, content)?;
        Ok(())
    }

    /// Validate configuration
    pub fn validate(&self) -> Result<(), ConfigError> {
        // Basic validation
        if self.window.width == 0 || self.window.height == 0 {
            return Err(ConfigError::ValidationError(
                "Window dimensions must be greater than 0".to_string()
            ));
        }

        if self.app.data_dir.is_empty() {
            return Err(ConfigError::ValidationError(
                "Data directory cannot be empty".to_string()
            ));
        }

        Ok(())
    }
}

/// Application-specific configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApplicationConfig {
    pub name: String,
    pub version: String,
    pub data_dir: PathBuf,
    pub cache_dir: PathBuf,
    pub log_dir: PathBuf,
    pub auto_save: bool,
    pub auto_save_interval: u64,
    pub max_recent_files: usize,
    pub check_updates: bool,
}

impl Default for ApplicationConfig {
    fn default() -> Self {
        Self {
            name: "WAI Terminal".to_string(),
            version: "0.1.0".to_string(),
            data_dir: PathBuf::from("./data"),
            cache_dir: PathBuf::from("./cache"),
            log_dir: PathBuf::from("./logs"),
            auto_save: true,
            auto_save_interval: 300,
            max_recent_files: 10,
            check_updates: true,
        }
    }
}
