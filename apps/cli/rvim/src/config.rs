use figment::{
    providers::{Env, Format, Toml},
    Figment,
};
use serde::Deserialize;

#[derive(Deserialize, Debug, Clone)]
pub struct AiConfig {
    pub api_key: String,
    pub endpoint: String,
}

#[derive(Deserialize, Debug)]
pub struct EditorConfig {
    pub theme: String,
    pub font_size: u8,
    pub line_numbers: bool,
    pub syntax_highlighting: bool,
    pub vim_mode: bool,
}

#[derive(Deserialize, Debug)]
pub struct TerminalConfig {
    pub default_shell: String,
}

#[derive(Deserialize, Debug)]
pub struct KeyBindingsConfig {
    pub save: String,
    pub quit: String,
    pub open_file: String,
    pub new_file: String,
}

impl Default for KeyBindingsConfig {
    fn default() -> Self {
        Self {
            save: "Ctrl+s".to_string(),
            quit: "Ctrl+q".to_string(),
            open_file: "Ctrl+o".to_string(),
            new_file: "Ctrl+n".to_string(),
        }
    }
}

#[derive(Deserialize, Debug, Clone)]
pub struct LspConfig {
    pub enabled: bool,
    pub rust_analyzer_path: Option<String>,
    pub typescript_language_server_path: Option<String>,
    pub python_language_server_path: Option<String>,
}

impl Default for LspConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            rust_analyzer_path: None,
            typescript_language_server_path: None,
            python_language_server_path: None,
        }
    }
}

#[derive(Deserialize, Debug)]
pub struct AppConfig {
    pub editor: EditorConfig,
    pub terminal: TerminalConfig,
    pub keybindings: KeyBindingsConfig,
    pub lsp: LspConfig,
    pub ai: Option<AiConfig>,
}

impl AppConfig {
    pub fn load() -> Result<Self, Box<figment::Error>> {
        Figment::new()
            .join(Toml::file("Config.toml"))
            .join(Env::prefixed("RVIM_").split("__"))
            .extract()
            .map_err(Box::new)
    }
}
