use figment::{
    providers::{Env, Format, Toml},
    Figment,
};
use serde::Deserialize;

#[derive(Deserialize, Debug, Clone)]
pub struct SchedulerConfig {
    pub max_concurrent_jobs: usize,
    pub job_timeout_ms: u64,
}

#[derive(Deserialize, Debug, Clone)]
pub struct QueueConfig {
    pub max_size: usize,
    pub retry_delay_ms: u64,
}

#[derive(Deserialize, Debug, Clone)]
pub struct LoggingConfig {
    pub level: String,
}

#[derive(Deserialize, Debug, Clone)]
pub struct AppConfig {
    pub scheduler: SchedulerConfig,
    pub queue: QueueConfig,
    pub logging: LoggingConfig,
}

impl AppConfig {
    pub fn load() -> Result<Self, figment::Error> {
        Figment::new()
            .join(Toml::file("Config.toml"))
            .join(Env::prefixed("SCHEDULER_").split("__"))
            .extract()
    }
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            scheduler: SchedulerConfig {
                max_concurrent_jobs: 10,
                job_timeout_ms: 30000,
            },
            queue: QueueConfig {
                max_size: 1000,
                retry_delay_ms: 5000,
            },
            logging: LoggingConfig {
                level: "info".to_string(),
            },
        }
    }
}
