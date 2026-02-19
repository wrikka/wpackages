//! Config module - uses config-suite package with legacy support

use figment::{
    providers::{Env, Format, Toml},
    Figment,
};
use serde::{Deserialize, Serialize};

pub use config::*;

// Re-export old config types for backward compatibility
use crate::types::{
    AdvancedConfig, AppearanceConfig, BehaviorConfig, ClipboardConfig, ConfigVersion, FontConfig,
    HotkeyConfig, ProfileConfig, PtyConfig, ThemeConfig, WindowConfig,
};

// Legacy config types for backward compatibility
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LegacyAppConfig {
    pub logging: LoggingConfig,
    pub pty: LegacyPtyConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoggingConfig {
    pub level: String,
}

impl Default for LoggingConfig {
    fn default() -> Self {
        Self {
            level: "info".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LegacyPtyConfig {
    pub shell: String,
    pub rows: u16,
    pub cols: u16,
}

impl Default for LegacyPtyConfig {
    fn default() -> Self {
        Self {
            shell: "cmd.exe".to_string(),
            rows: 24,
            cols: 80,
        }
    }
}

#[derive(Default, Serialize, Deserialize, Debug, Clone)]
pub struct AppConfig {
    pub logging: LoggingConfig,
    pub pty: LegacyPtyConfig,
}

impl AppConfig {
    pub fn load() -> Result<Self, Box<figment::Error>> {
        Figment::new()
            .join(Toml::file("Config.toml"))
            .join(Env::prefixed("APP_").split("__"))
            .extract()
            .map_err(Box::new)
    }
}
