//! Configuration management for AI suite

use figment::{
    providers::{Env, Format, Toml},
    Figment,
};
use serde::Deserialize;

/// Configuration for AI chat
#[derive(Deserialize, Debug, Clone)]
pub struct AiChatConfig {
    pub enabled: bool,
    pub model: String,
    pub max_tokens: usize,
    pub temperature: f32,
}

impl Default for AiChatConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            model: "gpt-4".to_string(),
            max_tokens: 2048,
            temperature: 0.7,
        }
    }
}

/// Configuration for AI completion
#[derive(Deserialize, Debug, Clone)]
pub struct CompletionConfig {
    pub enabled: bool,
    pub model: String,
    pub max_tokens: usize,
    pub temperature: f32,
    pub top_p: f32,
}

impl Default for CompletionConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            model: "gpt-4".to_string(),
            max_tokens: 256,
            temperature: 0.3,
            top_p: 0.95,
        }
    }
}

/// Configuration for embeddings
#[derive(Deserialize, Debug, Clone)]
pub struct EmbeddingsConfig {
    pub enabled: bool,
    pub model: String,
    pub batch_size: usize,
}

impl Default for EmbeddingsConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            model: "text-embedding-ada-002".to_string(),
            batch_size: 100,
        }
    }
}

/// Configuration for vector search
#[derive(Deserialize, Debug, Clone)]
pub struct VectorSearchConfig {
    pub enabled: bool,
    pub index_size: usize,
    pub top_k: usize,
}

impl Default for VectorSearchConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            index_size: 10000,
            top_k: 10,
        }
    }
}

/// Configuration for RAG
#[derive(Deserialize, Debug, Clone)]
pub struct RagConfig {
    pub enabled: bool,
    pub chunk_size: usize,
    pub chunk_overlap: usize,
    pub top_k: usize,
}

impl Default for RagConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            chunk_size: 512,
            chunk_overlap: 50,
            top_k: 5,
        }
    }
}

/// Main configuration for AI suite
#[derive(Deserialize, Debug, Clone)]
pub struct AiSuiteConfig {
    pub aichat: AiChatConfig,
    pub completion: CompletionConfig,
    pub embeddings: EmbeddingsConfig,
    pub vector_search: VectorSearchConfig,
    pub rag: RagConfig,
}

impl Default for AiSuiteConfig {
    fn default() -> Self {
        Self {
            aichat: AiChatConfig::default(),
            completion: CompletionConfig::default(),
            embeddings: EmbeddingsConfig::default(),
            vector_search: VectorSearchConfig::default(),
            rag: RagConfig::default(),
        }
    }
}

impl AiSuiteConfig {
    /// Load configuration from file and environment variables
    pub fn load() -> Result<Self, figment::Error> {
        Figment::new()
            .join(Toml::file("Ai.toml"))
            .join(Env::prefixed("AI_").split("__"))
            .extract()
    }

    /// Load configuration with defaults
    pub fn load_or_default() -> Self {
        Self::load().unwrap_or_default()
    }
}
