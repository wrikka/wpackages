use figment::{
    providers::{Env, Format, Toml},
    Figment,
};
use serde::Deserialize;
use std::env;


#[derive(Deserialize, Debug)]
pub struct AppConfig {
    pub app: AppConfigSection,
    pub logging: LoggingConfig,
    pub agent: self::agent_config::AgentConfig,
    pub models: ModelsConfig,
    pub cache: CacheConfig,
    pub memory: MemoryConfig,
    pub tools: ToolsConfig,
    pub security: SecurityConfig,
}

#[derive(Deserialize, Debug)]
pub struct AppConfigSection {
    pub name: String,
    pub version: String,
    pub environment: String,
}

#[derive(Deserialize, Debug)]
pub struct LoggingConfig {
    pub level: String,
    pub format: String,
}

#[derive(Deserialize, Debug)]
pub struct AgentConfig {
    pub max_concurrent_tasks: usize,
    pub task_timeout_seconds: u64,
    pub retry_attempts: u32,
    pub retry_delay_ms: u64,
}

#[derive(Deserialize, Debug)]
pub struct ModelsConfig {
    pub default_provider: String,
    pub default_model: String,
    pub api_key: Option<String>,
    pub temperature: f32,
    pub max_tokens: u32,
    pub timeout_seconds: u64,
    pub max_retries: u32,
}

#[derive(Deserialize, Debug)]
pub struct CacheConfig {
    pub enabled: bool,
    pub ttl_seconds: u64,
    pub max_size_mb: usize,
}

#[derive(Deserialize, Debug)]
pub struct MemoryConfig {
    pub enabled: bool,
    pub max_context_length: usize,
    pub retention_days: u32,
}

#[derive(Deserialize, Debug)]
pub struct ToolsConfig {
    pub browser_enabled: bool,
    pub browser_timeout_seconds: u64,
    pub file_access_enabled: bool,
    pub api_access_enabled: bool,
}

#[derive(Deserialize, Debug)]
pub struct SecurityConfig {
    pub max_api_calls_per_minute: u32,
    pub allowed_domains: Vec<String>,
    pub blocked_domains: Vec<String>,
}

impl AppConfig {
    pub fn load() -> Result<Self, figment::Error> {
        Figment::new()
            .join(Toml::file("Config.toml"))
            .join(Env::prefixed("AI_AGENT_").split("__"))
            .extract()
    }
}
