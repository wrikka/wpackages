use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct EditorConfig {
    pub syntax_highlight: bool,
    pub line_numbers: bool,
    pub git_blame: bool,
}

impl Default for EditorConfig {
    fn default() -> Self {
        Self {
            syntax_highlight: true,
            line_numbers: true,
            git_blame: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct UiConfig {
    pub theme_dark: bool,
    pub font_size: f32,
}

impl Default for UiConfig {
    fn default() -> Self {
        Self {
            theme_dark: true,
            font_size: 13.0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WorkspaceConfig {
    pub use_system_dialogs: bool,
    pub restore_last_project: bool,
}

impl Default for WorkspaceConfig {
    fn default() -> Self {
        Self {
            use_system_dialogs: true,
            restore_last_project: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct AppConfig {
    pub ui: UiConfig,
    pub editor: EditorConfig,
    pub workspace: WorkspaceConfig,
}

pub fn to_pretty_json(cfg: &AppConfig) -> String {
    serde_json::to_string_pretty(cfg).unwrap_or_else(|_| "{}".to_string())
}

pub fn parse_json(s: &str) -> Result<AppConfig, String> {
    serde_json::from_str::<AppConfig>(s).map_err(|e| e.to_string())
}
