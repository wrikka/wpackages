pub mod batch;
pub mod circuit;
pub mod rate;

pub use batch::{BatchConfig, QueueConfig};
pub use circuit::{CircuitConfig, RetryConfig};
pub use rate::{RateConfig, RedisConfig};

use figment::{
    providers::{Env, Format, Toml},
    Figment,
};
use serde::Deserialize;

#[derive(Deserialize, Debug, Clone)]
pub struct LoggingConfig {
    pub level: String,
}

#[derive(Deserialize, Debug, Clone)]
pub struct AppConfig {
    pub batch: BatchConfig,
    pub queue: QueueConfig,
    pub circuit: CircuitConfig,
    pub retry: RetryConfig,
    pub rate: RateConfig,
    pub redis: RedisConfig,
    pub logging: LoggingConfig,
}

impl AppConfig {
    pub fn load() -> Result<Self, figment::Error> {
        Figment::new()
            .join(Toml::file("Config.toml"))
            .join(Env::prefixed("RESILIENCE_").split("__"))
            .extract()
    }
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            batch: BatchConfig {
                max_size: 100,
                timeout_ms: 1000,
            },
            queue: QueueConfig { capacity: 1000 },
            circuit: CircuitConfig {
                failure_threshold: 5,
                success_threshold: 2,
                timeout_ms: 60000,
            },
            retry: RetryConfig {
                max_attempts: 3,
                backoff_ms: 1000,
            },
            rate: RateConfig {
                max_requests: 100,
                window_seconds: 60,
            },
            redis: RedisConfig {
                url: "redis://localhost".to_string(),
                key_prefix: "rate_limit".to_string(),
            },
            logging: LoggingConfig {
                level: "info".to_string(),
            },
        }
    }
}
