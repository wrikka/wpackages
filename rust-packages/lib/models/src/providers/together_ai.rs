//! Together AI provider implementation
//!
//! This module provides the Together AI provider for AI models.

use crate::error::{AiModelsError, Result};
use crate::types::traits::{ChatModel, CompletionModel, ModelProvider};
use crate::types::*;
use async_trait::async_trait;
use futures::Stream;
use reqwest::Client;
use serde_json::json;
use std::pin::Pin;

/// Together AI provider configuration
#[derive(Debug, Clone)]
pub struct TogetherAIConfig {
    pub api_key: String,
    pub base_url: String,
    pub timeout: u64,
}

impl Default for TogetherAIConfig {
    fn default() -> Self {
        Self {
            api_key: std::env::var("TOGETHER_API_KEY").unwrap_or_default(),
            base_url: "https://api.together.xyz/v1".to_string(),
            timeout: 30,
        }
    }
}

/// Together AI provider
pub struct TogetherAIProvider {
    config: TogetherAIConfig,
    client: Client,
}

impl TogetherAIProvider {
    pub fn new(config: TogetherAIConfig) -> Result<Self> {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout))
            .build()
            .map_err(|e| AiModelsError::NetworkError(e.to_string()))?;

        Ok(Self { config, client })
    }

    pub fn from_env() -> Result<Self> {
        Self::new(TogetherAIConfig::default())
    }
}

#[async_trait]
impl ModelProvider for TogetherAIProvider {
    fn name(&self) -> &str {
        "together_ai"
    }

    fn provider_type(&self) -> ProviderType {
        ProviderType::TogetherAI
    }

    async fn is_ready(&self) -> Result<bool> {
        Ok(!self.config.api_key.is_empty())
    }

    async fn list_models(&self) -> Result<Vec<ModelInfo>> {
        Ok(vec![
            ModelInfo {
                id: "mistralai/Mixtral-8x7B-Instruct-v0.1".to_string(),
                provider: ProviderType::TogetherAI,
                model_type: ModelType::Chat,
                display_name: "Mixtral 8x7B Instruct".to_string(),
                description: Some("A high-quality sparse mixture of experts model (SMoE) with open weights.".to_string()),
                website: Some("https://www.together.ai/".to_string()),
                context_length: 32768,
                supports_chat: true,
                supports_completion: false,
                supports_embeddings: false,
                supports_streaming: true,
                pricing: Some(ModelPricing {
                    input_price_per_1k: 0.0006,
                    output_price_per_1k: 0.0006,
                    currency: "USD".to_string(),
                }),
            },
            ModelInfo {
                id: "meta-llama/Llama-2-70b-chat-hf".to_string(),
                provider: ProviderType::TogetherAI,
                model_type: ModelType::Chat,
                display_name: "Llama 2 70B Chat".to_string(),
                description: Some("The Llama 2 70B chat model, fine-tuned for dialogue use cases.".to_string()),
                website: Some("https://www.together.ai/".to_string()),
                context_length: 4096,
                supports_chat: true,
                supports_completion: false,
                supports_embeddings: false,
                supports_streaming: true,
                pricing: Some(ModelPricing {
                    input_price_per_1k: 0.0009,
                    output_price_per_1k: 0.0009,
                    currency: "USD".to_string(),
                }),
            },
            ModelInfo {
                id: "NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO".to_string(),
                provider: ProviderType::TogetherAI,
                model_type: ModelType::Completion,
                display_name: "Nous Hermes 2 Mixtral".to_string(),
                description: Some("A state-of-the-art DPO fine-tune of Mixtral-8x7B.".to_string()),
                website: Some("https://www.together.ai/".to_string()),
                context_length: 32768,
                supports_chat: false,
                supports_completion: true,
                supports_embeddings: false,
                supports_streaming: true,
                pricing: Some(ModelPricing {
                    input_price_per_1k: 0.0006,
                    output_price_per_1k: 0.0006,
                    currency: "USD".to_string(),
                }),
            },
        ])
    }

    async fn get_model_info(&self, model_id: &str) -> Result<ModelInfo> {
        let models = self.list_models().await?;
        models
            .into_iter()
            .find(|m| m.id == model_id)
            .ok_or_else(|| AiModelsError::ModelNotFound {
                model_name: model_id.to_string(),
            })
    }
}

#[async_trait]
impl ChatModel for TogetherAIProvider {
    async fn chat(&self, request: ChatRequest) -> Result<ChatResponse> {
        let url = format!("{}/chat/completions", self.config.base_url);

        let messages: Vec<serde_json::Value> = request
            .messages
            .iter()
            .map(|m| {
                json!({
                    "role": match m.role {
                        MessageRole::System => "system",
                        MessageRole::User => "user",
                        MessageRole::Assistant => "assistant",
                        MessageRole::Tool => "tool",
                    },
                    "content": m.content
                })
            })
            .collect();

        let payload = json!({
            "model": request.model,
            "messages": messages,
            "temperature": request.temperature,
            "max_tokens": request.max_tokens,
        });

        let response = self
            .client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.config.api_key))
            .header("Content-Type", "application/json")
            .json(&payload)
            .send()
            .await
            .map_err(|e| AiModelsError::NetworkError(e.to_string()))?;

        if !response.status().is_success() {
            let status = response.status();
            let text = response.text().await.unwrap_or_default();
            return Err(AiModelsError::ApiError {
                status: status.as_u16(),
                message: text,
            });
        }

        let json: serde_json::Value = response
            .json()
            .await
            .map_err(|e| AiModelsError::Serialization(e.to_string()))?;

        let choice = json["choices"]
            .as_array()
            .and_then(|c| c.first())
            .ok_or_else(|| AiModelsError::Serialization("No choices in response".to_string()))?;

        let message = choice
            .get("message")
            .ok_or_else(|| AiModelsError::Serialization("No message in choice".to_string()))?;

        Ok(ChatResponse {
            id: json["id"].as_str().unwrap_or("").to_string(),
            object: json["object"]
                .as_str()
                .unwrap_or("chat.completion")
                .to_string(),
            created: json["created"].as_u64().unwrap_or_else(|| {
                std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_secs()
            }),
            model: request.model,
            choices: vec![ChatChoice {
                index: choice["index"].as_u64().unwrap_or(0) as u32,
                message: Message::assistant(message["content"].as_str().unwrap_or("").to_string()),
                finish_reason: choice["finish_reason"]
                    .as_str()
                    .unwrap_or("stop")
                    .to_string(),
            }],
            usage: Usage {
                prompt_tokens: json["usage"]["prompt_tokens"].as_u64().unwrap_or(0) as u32,
                completion_tokens: json["usage"]["completion_tokens"].as_u64().unwrap_or(0) as u32,
                total_tokens: json["usage"]["total_tokens"].as_u64().unwrap_or(0) as u32,
            },
        })
    }

    async fn chat_stream(
        &self,
        _request: ChatRequest,
    ) -> Result<Pin<Box<dyn Stream<Item = Result<ChatChunk>> + Send>>> {
        Err(AiModelsError::UnsupportedOperation {
            operation: "chat_stream".to_string(),
            model: "together_ai".to_string(),
        })
    }
}

#[async_trait]
impl CompletionModel for TogetherAIProvider {
    async fn complete(&self, request: CompletionRequest) -> Result<CompletionResponse> {
        let url = format!("{}/completions", self.config.base_url);

        let payload = json!({
            "model": request.model,
            "prompt": request.prompt,
            "temperature": request.temperature,
            "max_tokens": request.max_tokens,
        });

        let response = self
            .client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.config.api_key))
            .header("Content-Type", "application/json")
            .json(&payload)
            .send()
            .await
            .map_err(|e| AiModelsError::NetworkError(e.to_string()))?;

        if !response.status().is_success() {
            let status = response.status();
            let text = response.text().await.unwrap_or_default();
            return Err(AiModelsError::ApiError {
                status: status.as_u16(),
                message: text,
            });
        }

        let json: serde_json::Value = response
            .json()
            .await
            .map_err(|e| AiModelsError::Serialization(e.to_string()))?;

        let choice = json["choices"]
            .as_array()
            .and_then(|c| c.first())
            .ok_or_else(|| AiModelsError::Serialization("No choices in response".to_string()))?;

        Ok(CompletionResponse {
            id: json["id"].as_str().unwrap_or("").to_string(),
            object: json["object"]
                .as_str()
                .unwrap_or("text_completion")
                .to_string(),
            created: json["created"].as_u64().unwrap_or_else(|| {
                std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_secs()
            }),
            model: request.model,
            choices: vec![CompletionChoice {
                index: choice["index"].as_u64().unwrap_or(0) as u32,
                text: choice["text"].as_str().unwrap_or("").to_string(),
                finish_reason: choice["finish_reason"].as_str().map(|s| s.to_string()),
            }],
            usage: Usage {
                prompt_tokens: json["usage"]["prompt_tokens"].as_u64().unwrap_or(0) as u32,
                completion_tokens: json["usage"]["completion_tokens"].as_u64().unwrap_or(0) as u32,
                total_tokens: json["usage"]["total_tokens"].as_u64().unwrap_or(0) as u32,
            },
        })
    }

    async fn complete_stream(
        &self,
        _request: CompletionRequest,
    ) -> Result<Pin<Box<dyn Stream<Item = Result<CompletionChunk>> + Send>>> {
        Err(AiModelsError::UnsupportedOperation {
            operation: "complete_stream".to_string(),
            model: "together_ai".to_string(),
        })
    }
}
