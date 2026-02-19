use figment::{Figment, providers::{Format, Toml, Env}};
use serde::Deserialize;

#[derive(Deserialize, Debug, Clone)]
pub struct StreamConfig {
    pub buffer_size: usize,
    pub timeout_ms: u64,
}

#[derive(Deserialize, Debug, Clone)]
pub struct ProducerConfig {
    pub max_retries: u32,
}

#[derive(Deserialize, Debug, Clone)]
pub struct ConsumerConfig {
    pub batch_size: usize,
}

#[derive(Deserialize, Debug, Clone)]
pub struct LoggingConfig {
    pub level: String,
}

#[derive(Deserialize, Debug, Clone)]
pub struct AppConfig {
    pub stream: StreamConfig,
    pub producer: ProducerConfig,
    pub consumer: ConsumerConfig,
    pub logging: LoggingConfig,
}

impl AppConfig {
    pub fn load() -> Result<Self, figment::Error> {
        Figment::new()
            .join(Toml::file("Config.toml"))
            .join(Env::prefixed("STREAMING_").split("__"))
            .extract()
    }
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            stream: StreamConfig {
                buffer_size: 1000,
                timeout_ms: 5000,
            },
            producer: ProducerConfig {
                max_retries: 3,
            },
            consumer: ConsumerConfig {
                batch_size: 10,
            },
            logging: LoggingConfig {
                level: "info".to_string(),
            },
        }
    }
}
