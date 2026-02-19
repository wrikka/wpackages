use figment::{Figment, providers::{Format, Toml, Env}};
use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct DebuggingConfig {
    pub log_level: String,
    pub timeout_seconds: u64,
}

#[derive(Deserialize, Debug)]
pub struct AdapterConfig {
    pub protocol: String,
    pub host: String,
    pub port: u16,
}

#[derive(Deserialize, Debug)]
pub struct AppConfig {
    pub debugging: DebuggingConfig,
    pub adapter: AdapterConfig,
}

impl AppConfig {
    pub fn load() -> Result<Self, figment::Error> {
        Figment::new()
            .join(Toml::file("Config.toml"))
            .join(Env::prefixed("DEBUGGING_").split("__"))
            .extract()
    }
}
