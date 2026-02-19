use crate::error::{Result, TaskError};
use figment::{
    providers::{Env, Format, Toml},
    Figment,
};
use serde::Deserialize;

#[derive(Deserialize, Debug, Clone, Default)]
pub struct ParallelConfig {
    #[serde(default = "default_max_concurrency")]
    pub max_concurrency: usize,
    #[serde(default = "default_batch_size")]
    pub batch_size: usize,
}

fn default_max_concurrency() -> usize {
    10
}
fn default_batch_size() -> usize {
    100
}

#[derive(Deserialize, Debug, Clone, Default)]
pub struct QueueConfig {
    #[serde(default = "default_max_size")]
    pub max_size: usize,
    #[serde(default = "default_timeout_seconds")]
    pub timeout_seconds: u64,
}

fn default_max_size() -> usize {
    1000
}
fn default_timeout_seconds() -> u64 {
    300
}

#[derive(Deserialize, Debug, Clone, Default)]
pub struct SchedulerConfig {
    #[serde(default = "default_enabled")]
    pub enabled: bool,
    #[serde(default = "default_check_interval_seconds")]
    pub check_interval_seconds: u64,
}

fn default_enabled() -> bool {
    true
}
fn default_check_interval_seconds() -> u64 {
    60
}

#[derive(Deserialize, Debug, Clone, Default)]
pub struct RetryConfig {
    #[serde(default = "default_max_attempts")]
    pub max_attempts: usize,
    #[serde(default = "default_backoff_strategy")]
    pub backoff_strategy: String,
    #[serde(default = "default_initial_backoff_ms")]
    pub initial_backoff_ms: u64,
    #[serde(default = "default_backoff_multiplier")]
    pub backoff_multiplier: f64,
}

fn default_max_attempts() -> usize {
    3
}
fn default_backoff_strategy() -> String {
    "exponential".to_string()
}
fn default_initial_backoff_ms() -> u64 {
    100
}
fn default_backoff_multiplier() -> f64 {
    2.0
}

#[derive(Deserialize, Debug, Clone, Default)]
pub struct PersistenceConfig {
    #[serde(default = "default_enabled")]
    pub enabled: bool,
    #[serde(default = "default_database_path")]
    pub database_path: String,
}

fn default_enabled() -> bool {
    true
}
fn default_database_path() -> String {
    "tasks.db".to_string()
}

#[derive(Deserialize, Debug, Clone)]
pub struct Config {
    #[serde(default)]
    pub parallel: ParallelConfig,
    #[serde(default)]
    pub queue: QueueConfig,
    #[serde(default)]
    pub scheduler: SchedulerConfig,
    #[serde(default)]
    pub retry: RetryConfig,
    #[serde(default)]
    pub persistence: PersistenceConfig,
}

impl Config {
    pub fn load() -> Result<Self> {
        Figment::new()
            .join(Toml::file("Config.toml"))
            .join(Env::prefixed("TASK_").split("__"))
            .extract()
            .map_err(TaskError::Config)
    }

    pub fn default() -> Self {
        Config {
            parallel: ParallelConfig {
                max_concurrency: default_max_concurrency(),
                batch_size: default_batch_size(),
            },
            queue: QueueConfig {
                max_size: default_max_size(),
                timeout_seconds: default_timeout_seconds(),
            },
            scheduler: SchedulerConfig {
                enabled: default_enabled(),
                check_interval_seconds: default_check_interval_seconds(),
            },
            retry: RetryConfig {
                max_attempts: default_max_attempts(),
                backoff_strategy: default_backoff_strategy(),
                initial_backoff_ms: default_initial_backoff_ms(),
                backoff_multiplier: default_backoff_multiplier(),
            },
            persistence: PersistenceConfig {
                enabled: default_enabled(),
                database_path: default_database_path(),
            },
        }
    }
}

impl Default for Config {
    fn default() -> Self {
        Self::default()
    }
}
