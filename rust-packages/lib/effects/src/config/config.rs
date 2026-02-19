use figment::{
    providers::{Env, Format, Toml},
    Figment,
};
use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct EffectConfig {
    pub max_retries: u32,
    pub timeout_ms: u64,
}

#[derive(Deserialize, Debug)]
pub struct LoggingConfig {
    pub level: String,
    pub format: String,
}

#[derive(Deserialize, Debug)]
pub struct AppConfig {
    pub effect: EffectConfig,
    pub logging: LoggingConfig,
}

impl AppConfig {
    pub fn load() -> Result<Self, figment::Error> {
        Figment::new()
            .join(Toml::file("Config.toml"))
            .join(Env::prefixed("EFFECT_").split("__"))
            .extract()
    }
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            effect: EffectConfig {
                max_retries: 3,
                timeout_ms: 5000,
            },
            logging: LoggingConfig {
                level: "info".to_string(),
                format: "json".to_string(),
            },
        }
    }
}
