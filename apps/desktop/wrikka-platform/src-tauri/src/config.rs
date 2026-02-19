use figment::{Figment, providers::{Format, Toml, Env}};
use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct AppConfig {
    pub terminal: TerminalConfig,
    pub window: WindowConfig,
}

#[derive(Deserialize, Debug)]
pub struct TerminalConfig {
    pub default_shell: String,
    pub font_size: u8,
    pub theme: String,
}

#[derive(Deserialize, Debug)]
pub struct WindowConfig {
    pub width: u32,
    pub height: u32,
    pub resizable: bool,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            terminal: TerminalConfig {
                default_shell: "cmd.exe".to_string(),
                font_size: 14,
                theme: "dark".to_string(),
            },
            window: WindowConfig {
                width: 1200,
                height: 800,
                resizable: true,
            },
        }
    }
}

impl AppConfig {
    pub fn load() -> Result<Self, figment::Error> {
        Figment::new()
            .join(Toml::file("Config.toml"))
            .join(Env::prefixed("DESKTOP_").split("__"))
            .extract()
    }
}
