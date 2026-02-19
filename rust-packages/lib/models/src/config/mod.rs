//! Provider configuration structures
//!
//! This module defines configuration for different AI model providers.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Configuration for a specific provider
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderConfig {
    pub provider_type: ProviderType,
    pub api_key: Option<String>,
    pub base_url: Option<String>,
    pub timeout_seconds: u64,
    pub max_retries: u32,
    pub enabled: bool,
}

impl ProviderConfig {
    pub fn new(provider_type: ProviderType) -> Self {
        Self {
            provider_type,
            api_key: None,
            base_url: None,
            timeout_seconds: 30,
            max_retries: 3,
            enabled: true,
        }
    }

    pub fn with_api_key(mut self, api_key: impl Into<String>) -> Self {
        self.api_key = Some(api_key.into());
        self
    }

    pub fn with_base_url(mut self, base_url: impl Into<String>) -> Self {
        self.base_url = Some(base_url.into());
        self
    }

    pub fn with_timeout(mut self, timeout_seconds: u64) -> Self {
        self.timeout_seconds = timeout_seconds;
        self
    }

    pub fn with_max_retries(mut self, max_retries: u32) -> Self {
        self.max_retries = max_retries;
        self
    }

    pub fn enabled(mut self, enabled: bool) -> Self {
        self.enabled = enabled;
        self
    }
}

/// Type of cache backend
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "snake_case")]
pub enum CacheBackendType {
    #[default]
    InMemory,
    File,
}

/// Cache configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheConfig {
    pub enabled: bool,
    pub ttl_seconds: u64,
    pub backend: CacheBackendType,
    pub path: Option<String>,
}

impl Default for CacheConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            ttl_seconds: 3600,
            backend: CacheBackendType::default(),
            path: None,
        }
    }
}

/// Retry configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetryConfig {
    pub max_attempts: u32,
    pub initial_delay_ms: u64,
    pub max_delay_ms: u64,
    pub backoff_multiplier: f64,
    pub retryable_errors: Vec<String>,
}

impl Default for RetryConfig {
    fn default() -> Self {
        Self {
            max_attempts: 3,
            initial_delay_ms: 1000,
            max_delay_ms: 10000,
            backoff_multiplier: 2.0,
            retryable_errors: vec![
                "timeout".to_string(),
                "rate_limit".to_string(),
                "server_error".to_string(),
            ],
        }
    }
}

/// Strategy configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StrategyConfig {
    pub strategy_type: StrategyType,
    pub fallback_enabled: bool,
    pub fallback_providers: Vec<String>,
    pub load_balancing: Option<LoadBalancingConfig>,
    pub cost_optimization: Option<CostOptimizationConfig>,
}

impl Default for StrategyConfig {
    fn default() -> Self {
        Self {
            strategy_type: StrategyType::RoundRobin,
            fallback_enabled: true,
            fallback_providers: vec![],
            load_balancing: None,
            cost_optimization: None,
        }
    }
}

/// Strategy type for model selection
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum StrategyType {
    RoundRobin,
    LeastLatency,
    LowestCost,
    Priority,
}

/// Load balancing configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoadBalancingConfig {
    pub weights: HashMap<String, f64>,
}

/// Cost optimization configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CostOptimizationConfig {
    pub budget_per_hour: Option<f64>,
    pub prefer_cheaper: bool,
}

/// Moderation configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModerationConfig {
    pub enabled: bool,
}

impl Default for ModerationConfig {
    fn default() -> Self {
        Self { enabled: false }
    }
}

/// Rate limiting configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimitConfig {
    pub requests_per_minute: Option<u32>,
    pub tokens_per_minute: Option<u32>,
}

impl Default for RateLimitConfig {
    fn default() -> Self {
        Self {
            requests_per_minute: None,
            tokens_per_minute: None,
        }
    }
}

/// Full AI models configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiModelsConfig {
    pub providers: HashMap<String, ProviderConfig>,
    pub cache: CacheConfig,
    pub retry: RetryConfig,
    pub strategy: StrategyConfig,
    pub moderation: ModerationConfig,
    pub rate_limit: RateLimitConfig,
}

impl Default for AiModelsConfig {
    fn default() -> Self {
        Self {
            providers: HashMap::new(),
            cache: CacheConfig::default(),
            retry: RetryConfig::default(),
            strategy: StrategyConfig::default(),
            moderation: ModerationConfig::default(),
            rate_limit: RateLimitConfig::default(),
        }
    }
}

/// Provider type enum for configuration
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ProviderType {
    OpenAI,
    Anthropic,
    Ollama,
    Groq,
    Mistral,
    AzureOpenAI,
    GoogleGemini,
    Bedrock,
    Cohere,
    Fireworks,
    HuggingFace,
    Perplexity,
    Replicate,
    TogetherAI,
    VertexAI,
    LumaAI,
    StabilityAI,
    ElevenLabs,
    SunoAI,
}

impl ProviderType {
    pub fn as_str(&self) -> &'static str {
        match self {
            ProviderType::OpenAI => "openai",
            ProviderType::Anthropic => "anthropic",
            ProviderType::Ollama => "ollama",
            ProviderType::Groq => "groq",
            ProviderType::Mistral => "mistral",
            ProviderType::AzureOpenAI => "azure_openai",
            ProviderType::GoogleGemini => "google_gemini",
            ProviderType::Bedrock => "bedrock",
            ProviderType::Cohere => "cohere",
            ProviderType::Fireworks => "fireworks",
            ProviderType::HuggingFace => "huggingface",
            ProviderType::Perplexity => "perplexity",
            ProviderType::Replicate => "replicate",
            ProviderType::TogetherAI => "together_ai",
            ProviderType::VertexAI => "vertex_ai",
            ProviderType::LumaAI => "luma_ai",
            ProviderType::StabilityAI => "stability_ai",
            ProviderType::ElevenLabs => "eleven_labs",
            ProviderType::SunoAI => "suno_ai",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "openai" => Some(ProviderType::OpenAI),
            "anthropic" => Some(ProviderType::Anthropic),
            "ollama" => Some(ProviderType::Ollama),
            "groq" => Some(ProviderType::Groq),
            "mistral" => Some(ProviderType::Mistral),
            "azure_openai" => Some(ProviderType::AzureOpenAI),
            "google_gemini" => Some(ProviderType::GoogleGemini),
            "bedrock" => Some(ProviderType::Bedrock),
            "cohere" => Some(ProviderType::Cohere),
            "fireworks" => Some(ProviderType::Fireworks),
            "huggingface" => Some(ProviderType::HuggingFace),
            "perplexity" => Some(ProviderType::Perplexity),
            "replicate" => Some(ProviderType::Replicate),
            "together_ai" => Some(ProviderType::TogetherAI),
            "vertex_ai" => Some(Self::VertexAI),
            "luma_ai" => Some(Self::LumaAI),
            "stability_ai" => Some(Self::StabilityAI),
            "eleven_labs" => Some(Self::ElevenLabs),
            "suno_ai" => Some(Self::SunoAI),
            _ => None,
        }
    }
}
