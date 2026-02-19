use figment::{Figment, providers::{Format, Toml, Env}};
use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct RsuiConfig {
    pub theme: ThemeConfig,
    pub window: WindowConfig,
}

#[derive(Deserialize, Debug)]
pub struct ThemeConfig {
    pub mode: String,
    pub accent_color: String,
    pub font_size: u8,
}

#[derive(Deserialize, Debug)]
pub struct WindowConfig {
    pub title: String,
    pub width: u32,
    pub height: u32,
    pub resizable: bool,
}

impl Default for RsuiConfig {
    fn default() -> Self {
        Self {
            theme: ThemeConfig {
                mode: "dark".to_string(),
                accent_color: "#2563eb".to_string(),
                font_size: 14,
            },
            window: WindowConfig {
                title: "WAI Terminal".to_string(),
                width: 1200,
                height: 800,
                resizable: true,
            },
        }
    }
}

impl RsuiConfig {
    pub fn load() -> Result<Self, figment::Error> {
        Figment::new()
            .join(Toml::file("Config.toml"))
            .join(Env::prefixed("RSUI_").split("__"))
            .extract()
    }
}
