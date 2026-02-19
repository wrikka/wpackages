//! Configuration management using figment

use figment::{
    providers::{Env, Format, Toml},
    Figment,
};
use serde::{Deserialize, Serialize};

/// Theme configuration
#[derive(Deserialize, Debug, Clone, Serialize)]
pub struct ThemeConfig {
    pub name: String,
    pub dark_mode: bool,
}

/// Command palette configuration
#[derive(Deserialize, Debug, Clone, Serialize)]
pub struct CommandPaletteConfig {
    pub max_history: usize,
    pub fuzzy_threshold: f64,
}

/// File explorer configuration
#[derive(Deserialize, Debug, Clone, Serialize)]
pub struct FileExplorerConfig {
    pub show_hidden: bool,
    pub max_depth: usize,
}

/// Chat panel configuration
#[derive(Deserialize, Debug, Clone, Serialize)]
pub struct ChatPanelConfig {
    pub show_timestamps: bool,
    pub auto_scroll: bool,
    pub max_messages: usize,
}

/// Application configuration
#[derive(Deserialize, Debug, Clone)]
pub struct AppConfig {
    pub theme: ThemeConfig,
    pub command_palette: CommandPaletteConfig,
    pub file_explorer: FileExplorerConfig,
    pub chat_panel: ChatPanelConfig,
}

impl AppConfig {
    /// Load configuration from file and environment variables
    pub fn load() -> Result<Self, figment::Error> {
        Figment::new()
            .join(Toml::file("Config.toml"))
            .join(Env::prefixed("TUI_COMPONENTS_").split("__"))
            .extract()
    }

    /// Load configuration with default values
    pub fn load_or_default() -> Self {
        Self::load().unwrap_or_else(|_| Self::default())
    }
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            theme: ThemeConfig {
                name: "default".to_string(),
                dark_mode: true,
            },
            command_palette: CommandPaletteConfig {
                max_history: 100,
                fuzzy_threshold: 0.6,
            },
            file_explorer: FileExplorerConfig {
                show_hidden: false,
                max_depth: 10,
            },
            chat_panel: ChatPanelConfig {
                show_timestamps: true,
                auto_scroll: true,
                max_messages: 1000,
            },
        }
    }
}
