use figment::{Figment, providers::{Format, Toml, Env}};
use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct PerformanceConfig {
    pub log_level: String,
    pub timeout_seconds: u64,
}

#[derive(Deserialize, Debug)]
pub struct MonitoringConfig {
    pub interval_ms: u64,
}

#[derive(Deserialize, Debug)]
pub struct AppConfig {
    pub performance: PerformanceConfig,
    pub monitoring: MonitoringConfig,
}

impl AppConfig {
    pub fn load() -> Result<Self, figment::Error> {
        Figment::new()
            .join(Toml::file("Config.toml"))
            .join(Env::prefixed("PERFORMANCE_").split("__"))
            .extract()
    }
}
