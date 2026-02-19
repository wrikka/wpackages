//! Model and provider types
//!
//! This module defines types for models and providers.

use serde::{Deserialize, Serialize};

/// Model type enum
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ModelType {
    Chat,
    Completion,
    Embeddings,
    Image,
    Video,
    Audio,
}

/// Provider type enum
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ProviderType {
    OpenAI,
    Anthropic,
    Ollama,
    Groq,
    Mistral,
    Cohere,
    HuggingFace,
    VertexAI,
    TogetherAI,
    Replicate,
    Bedrock,
    Perplexity,
    Fireworks,
}

impl ProviderType {
    pub fn as_str(&self) -> &'static str {
        match self {
            ProviderType::OpenAI => "openai",
            ProviderType::Anthropic => "anthropic",
            ProviderType::Ollama => "ollama",
            ProviderType::Groq => "groq",
            ProviderType::Mistral => "mistral",
            ProviderType::Cohere => "cohere",
            ProviderType::HuggingFace => "huggingface",
            ProviderType::VertexAI => "vertex-ai",
            ProviderType::TogetherAI => "together-ai",
            ProviderType::Replicate => "replicate",
            ProviderType::Bedrock => "bedrock",
            ProviderType::Perplexity => "perplexity",
            ProviderType::Fireworks => "fireworks",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "openai" => Some(ProviderType::OpenAI),
            "anthropic" => Some(ProviderType::Anthropic),
            "ollama" => Some(ProviderType::Ollama),
            "groq" => Some(ProviderType::Groq),
            "mistral" => Some(ProviderType::Mistral),
            "cohere" => Some(ProviderType::Cohere),
            "huggingface" => Some(ProviderType::HuggingFace),
            "vertex-ai" | "vertexai" => Some(ProviderType::VertexAI),
            "together-ai" | "togetherai" => Some(ProviderType::TogetherAI),
            "replicate" => Some(ProviderType::Replicate),
            "bedrock" | "aws-bedrock" => Some(ProviderType::Bedrock),
            "perplexity" => Some(ProviderType::Perplexity),
            "fireworks" => Some(ProviderType::Fireworks),
            _ => None,
        }
    }
}

/// Model information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelInfo {
    pub id: String,
    pub provider: ProviderType,
    pub model_type: ModelType,
    pub display_name: String,
    pub description: Option<String>,
    pub website: Option<String>,
    pub context_length: u32,
    pub supports_chat: bool,
    pub supports_completion: bool,
    pub supports_embeddings: bool,
    pub supports_streaming: bool,
    pub pricing: Option<ModelPricing>,
}

/// Model pricing information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelPricing {
    pub input_price_per_1k: f64,
    pub output_price_per_1k: f64,
    pub currency: String,
}
