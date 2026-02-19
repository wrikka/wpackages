use crate::constants::{DEFAULT_PTY_COLS, DEFAULT_PTY_ROWS};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct PtyConfig {
    pub rows: u16,
    pub cols: u16,
    pub shell: String,
    pub shell_args: Vec<String>,
}

impl Default for PtyConfig {
    fn default() -> Self {
        let shell = if cfg!(windows) {
            "powershell.exe".to_string()
        } else {
            "/bin/bash".to_string()
        };
        Self {
            rows: DEFAULT_PTY_ROWS,
            cols: DEFAULT_PTY_COLS,
            shell,
            shell_args: vec![],
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ThemeConfig {
    pub background: String,
    pub foreground: String,
    pub primary: String,
}

impl Default for ThemeConfig {
    fn default() -> Self {
        Self {
            background: "#1E1E2E".to_string(),
            foreground: "#CDD6F4".to_string(),
            primary: "#89B4FA".to_string(),
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct FontConfig {
    pub family: String,
    pub size: u8,
}

impl Default for FontConfig {
    fn default() -> Self {
        Self {
            family: "monospace".to_string(),
            size: 14,
        }
    }
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
pub struct AppConfig {
    pub pty: PtyConfig,
    pub theme: ThemeConfig,
    pub font: FontConfig,
}
