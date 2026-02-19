use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConfigFormat {
    Toml,
    Json,
    Yaml,
}

impl Default for ConfigFormat {
    fn default() -> Self {
        Self::Toml
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowConfig {
    pub width: u32,
    pub height: u32,
    pub x: Option<i32>,
    pub y: Option<i32>,
    pub maximized: bool,
    pub fullscreen: bool,
    pub always_on_top: bool,
    pub title: String,
}

impl Default for WindowConfig {
    fn default() -> Self {
        Self {
            width: 1200,
            height: 800,
            x: None,
            y: None,
            maximized: false,
            fullscreen: false,
            always_on_top: false,
            title: "Terminal".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppearanceConfig {
    pub theme_id: String,
    pub theme_variant: String,
    pub font: FontConfig,
    pub show_scrollbar: bool,
    pub show_tab_bar: bool,
    pub show_status_bar: bool,
    pub tab_bar_position: String,
}

impl Default for AppearanceConfig {
    fn default() -> Self {
        Self {
            theme_id: "default-dark".to_string(),
            theme_variant: "dark".to_string(),
            font: FontConfig::default(),
            show_scrollbar: true,
            show_tab_bar: true,
            show_status_bar: true,
            tab_bar_position: "top".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FontConfig {
    pub family: String,
    pub size: u32,
    pub line_height: f32,
    pub letter_spacing: f32,
}

impl Default for FontConfig {
    fn default() -> Self {
        Self {
            family: "Consolas".to_string(),
            size: 14,
            line_height: 1.2,
            letter_spacing: 0.0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehaviorConfig {
    pub confirm_close: bool,
    pub confirm_exit: bool,
    pub auto_save: bool,
    pub restore_session: bool,
    pub shell_integration: bool,
    pub copy_on_select: bool,
    pub right_click_action: String,
}

impl Default for BehaviorConfig {
    fn default() -> Self {
        Self {
            confirm_close: false,
            confirm_exit: false,
            auto_save: true,
            restore_session: false,
            shell_integration: true,
            copy_on_select: false,
            right_click_action: "paste".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdvancedConfig {
    pub enable_gpu_acceleration: bool,
    pub enable_telemetry: bool,
    pub enable_error_reporting: bool,
    pub log_level: String,
    pub max_log_size_mb: usize,
    pub max_log_files: usize,
    pub update_check: bool,
}

impl Default for AdvancedConfig {
    fn default() -> Self {
        Self {
            enable_gpu_acceleration: true,
            enable_telemetry: false,
            enable_error_reporting: false,
            log_level: "info".to_string(),
            max_log_size_mb: 10,
            max_log_files: 5,
            update_check: true,
        }
    }
}

// Additional configuration types for WAI IDE

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TerminalConfig {
    pub shell: String,
    pub args: Vec<String>,
    pub env: HashMap<String, String>,
    pub rows: u16,
    pub cols: u16,
    pub scrollback_size: usize,
    pub copy_on_select: bool,
}

impl Default for TerminalConfig {
    fn default() -> Self {
        Self {
            shell: "powershell.exe".to_string(),
            args: vec![],
            env: HashMap::new(),
            rows: 24,
            cols: 80,
            scrollback_size: 10000,
            copy_on_select: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EditorConfig {
    pub tab_size: u32,
    pub insert_spaces: bool,
    pub word_wrap: bool,
    pub line_numbers: bool,
    pub minimap: bool,
    pub font_size: u32,
    pub font_family: String,
}

impl Default for EditorConfig {
    fn default() -> Self {
        Self {
            tab_size: 4,
            insert_spaces: true,
            word_wrap: false,
            line_numbers: true,
            minimap: true,
            font_size: 14,
            font_family: "Consolas".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyBindingsConfig {
    pub profile: String,
    pub bindings: HashMap<String, String>,
}

impl Default for KeyBindingsConfig {
    fn default() -> Self {
        Self {
            profile: "default".to_string(),
            bindings: HashMap::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginsConfig {
    pub enabled: bool,
    pub auto_update: bool,
    pub plugins: Vec<PluginConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginConfig {
    pub name: String,
    pub version: String,
    pub enabled: bool,
    pub config: HashMap<String, serde_json::Value>,
}

impl Default for PluginsConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            auto_update: false,
            plugins: vec![],
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoggingConfig {
    pub level: String,
    pub file: Option<PathBuf>,
    pub max_size: Option<usize>,
    pub max_files: Option<usize>,
}

impl Default for LoggingConfig {
    fn default() -> Self {
        Self {
            level: "info".to_string(),
            file: Some(PathBuf::from("logs/wai.log")),
            max_size: Some(10 * 1024 * 1024), // 10MB
            max_files: Some(5),
        }
    }
}
