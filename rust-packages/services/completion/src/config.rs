//! Completion Configuration
//! 
//! Configuration management using Figment

use crate::error::{CompletionError, CompletionResult};
use figment::{
    providers::{Env, Format, Toml},
    Figment,
};
use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct CompletionConfig {
    #[validate]
    pub api: ApiConfig,
    #[validate]
    pub cache: CacheConfig,
    #[validate]
    pub rate_limit: RateLimitConfig,
    pub streaming: StreamingConfig,
    #[validate]
    pub context_window: ContextWindowConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct ApiConfig {
    #[validate(length(min = 1, message = "API key cannot be empty"))]
    pub api_key: String,
    #[validate(length(min = 1, message = "Model cannot be empty"))]
    pub model: String,
    #[validate(url(message = "Invalid base URL"))]
    pub base_url: Option<String>,
    #[validate(range(min = 1, message = "Max tokens must be greater than 0"))]
    pub max_tokens: usize,
    #[validate(range(min = 0.0, max = 2.0, message = "Temperature must be between 0.0 and 2.0"))]
    pub temperature: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct CacheConfig {
    pub enabled: bool,
    #[validate(range(min = 1, message = "Cache max capacity must be greater than 0"))]
    pub max_capacity: u64,
    pub ttl_seconds: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct RateLimitConfig {
    pub enabled: bool,
    #[validate(range(min = 1, message = "Rate limit capacity must be greater than 0"))]
    pub capacity: usize,
    pub refill_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamingConfig {
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct ContextWindowConfig {
    #[validate(range(min = 1, message = "Context window max tokens must be greater than 0"))]
    pub max_tokens: usize,
}

impl Default for CompletionConfig {
    fn default() -> Self {
        Self {
            api: ApiConfig {
                api_key: String::new(),
                model: String::new(),
                base_url: None,
                max_tokens: 2048,
                temperature: 0.7,
            },
            cache: CacheConfig {
                enabled: true,
                max_capacity: 1000,
                ttl_seconds: 3600,
            },
            rate_limit: RateLimitConfig {
                enabled: true,
                capacity: 100,
                refill_ms: 60000,
            },
            streaming: StreamingConfig { enabled: true },
            context_window: ContextWindowConfig { max_tokens: 4096 },
        }
    }
}

impl CompletionConfig {
    pub fn load() -> Result<Self, figment::Error> {
        Figment::new()
            .join(Toml::file("Config.toml"))
            .join(Env::prefixed("COMPLETION_").split("__"))
            .extract()
    }

    pub fn validate(&self) -> CompletionResult<()> {
        self.validate().map_err(CompletionError::from)
    }
}

impl From<validator::ValidationErrors> for CompletionError {
    fn from(errors: validator::ValidationErrors) -> Self {
        CompletionError::Config(errors.to_string())
    }
}
