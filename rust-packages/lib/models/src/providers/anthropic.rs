//! Anthropic provider implementation
//!
//! This module provides the Anthropic provider for AI models.

use crate::error::{AiModelsError, Result};
use crate::types::traits::{ChatModel, ModelProvider};
use crate::types::*;
use async_trait::async_trait;
use futures::Stream;
use reqwest::Client;
use serde_json::json;
use std::pin::Pin;

/// Anthropic provider configuration
#[derive(Debug, Clone)]
pub struct AnthropicConfig {
    pub api_key: String,
    pub base_url: String,
    pub timeout: u64,
}

impl Default for AnthropicConfig {
    fn default() -> Self {
        Self {
            api_key: std::env::var("ANTHROPIC_API_KEY").unwrap_or_default(),
            base_url: "https://api.anthropic.com/v1".to_string(),
            timeout: 30,
        }
    }
}

impl AnthropicConfig {
    pub fn new(api_key: impl Into<String>) -> Self {
        Self {
            api_key: api_key.into(),
            ..Default::default()
        }
    }

    pub fn with_base_url(mut self, base_url: impl Into<String>) -> Self {
        self.base_url = base_url.into();
        self
    }

    pub fn with_timeout(mut self, timeout: u64) -> Self {
        self.timeout = timeout;
        self
    }
}

/// Anthropic provider
pub struct AnthropicProvider {
    config: AnthropicConfig,
    client: Client,
}

impl AnthropicProvider {
    pub fn new(config: AnthropicConfig) -> Self {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout))
            .build()
            .expect("Failed to create HTTP client");

        Self { config, client }
    }

    fn get_headers(&self) -> reqwest::header::HeaderMap {
        let mut headers = reqwest::header::HeaderMap::new();
        headers.insert("x-api-key", self.config.api_key.parse().unwrap());
        headers.insert(
            "anthropic-version",
            reqwest::header::HeaderValue::from_static("2023-06-01"),
        );
        headers.insert(
            reqwest::header::CONTENT_TYPE,
            reqwest::header::HeaderValue::from_static("application/json"),
        );
        headers
    }

    fn convert_messages(&self, messages: &[Message]) -> Vec<serde_json::Value> {
        messages
            .iter()
            .map(|m| {
                json!({
                    "role": match m.role {
                        MessageRole::System => "user",
                        MessageRole::User => "user",
                        MessageRole::Assistant => "assistant",
                        MessageRole::Tool => "user",
                    },
                    "content": m.content,
                })
            })
            .collect()
    }
}

#[async_trait]
impl ModelProvider for AnthropicProvider {
    fn name(&self) -> &str {
        "anthropic"
    }

    fn provider_type(&self) -> ProviderType {
        ProviderType::Anthropic
    }

    async fn is_ready(&self) -> Result<bool> {
        if self.config.api_key.is_empty() {
            return Ok(false);
        }
        Ok(true)
    }

    async fn list_models(&self) -> Result<Vec<ModelInfo>> {
        Ok(vec![
            ModelInfo {
                id: "claude-3-opus-20240229".to_string(),
                provider: ProviderType::Anthropic,
                model_type: ModelType::Chat,
                display_name: "Claude 3 Opus".to_string(),
                description: Some("Most powerful model for highly complex tasks".to_string()),
                website: Some("https://www.anthropic.com/claude".to_string()),
                context_length: 200000,
                supports_chat: true,
                supports_completion: false,
                supports_embeddings: false,
                supports_streaming: true,
                pricing: Some(ModelPricing {
                    input_price_per_1k: 0.015,
                    output_price_per_1k: 0.075,
                    currency: "USD".to_string(),
                }),
            },
            ModelInfo {
                id: "claude-3-sonnet-20240229".to_string(),
                provider: ProviderType::Anthropic,
                model_type: ModelType::Chat,
                display_name: "Claude 3 Sonnet".to_string(),
                description: Some("Ideal balance of intelligence and speed for enterprise workloads".to_string()),
                website: Some("https://www.anthropic.com/claude".to_string()),
                context_length: 200000,
                supports_chat: true,
                supports_completion: false,
                supports_embeddings: false,
                supports_streaming: true,
                pricing: Some(ModelPricing {
                    input_price_per_1k: 0.003,
                    output_price_per_1k: 0.015,
                    currency: "USD".to_string(),
                }),
            },
            ModelInfo {
                id: "claude-3-haiku-20240307".to_string(),
                provider: ProviderType::Anthropic,
                model_type: ModelType::Chat,
                display_name: "Claude 3 Haiku".to_string(),
                context_length: 200000,
                supports_chat: true,
                supports_completion: false,
                supports_embeddings: false,
                supports_streaming: true,
                pricing: None,
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
impl ChatModel for AnthropicProvider {
    async fn chat(&self, request: ChatRequest) -> Result<ChatResponse> {
        let url = format!("{}/messages", self.config.base_url);

        let request_body = json!({
            "model": request.model,
            "messages": self.convert_messages(&request.messages),
            "max_tokens": request.max_tokens.unwrap_or(1024),
            "temperature": request.temperature,
            "top_p": request.top_p,
            "stream": false,
        });

        let response = self
            .client
            .post(&url)
            .headers(self.get_headers())
            .json(&request_body)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();

            return if status.as_u16() == 429 {
                Err(AiModelsError::RateLimitExceeded {
                    limit: 0,
                    window: "minute".to_string(),
                })
            } else if status.as_u16() == 401 {
                Err(AiModelsError::AuthenticationError {
                    provider: "anthropic".to_string(),
                })
            } else {
                Err(AiModelsError::ProviderError {
                    provider: "anthropic".to_string(),
                    source: anyhow::anyhow!("Chat request failed: {} - {}", status, error_text),
                })
            };
        }

        let anthropic_response: serde_json::Value = response.json().await?;

        let content = anthropic_response["content"][0]["text"]
            .as_str()
            .ok_or_else(|| AiModelsError::InvalidInput("Invalid response format".to_string()))?;

        Ok(ChatResponse {
            id: anthropic_response["id"].as_str().unwrap_or("").to_string(),
            object: "chat.completion".to_string(),
            created: anthropic_response["created_at"].as_u64().unwrap_or(0),
            model: request.model,
            choices: vec![ChatChoice {
                index: 0,
                message: Message::assistant(content),
                finish_reason: anthropic_response["stop_reason"]
                    .as_str()
                    .unwrap_or("stop")
                    .to_string(),
            }],
            usage: Usage {
                prompt_tokens: anthropic_response["usage"]["input_tokens"]
                    .as_u64()
                    .unwrap_or(0) as u32,
                completion_tokens: anthropic_response["usage"]["output_tokens"]
                    .as_u64()
                    .unwrap_or(0) as u32,
                total_tokens: 0,
            },
        })
    }

    async fn chat_stream(
        &self,
        _request: ChatRequest,
    ) -> Result<Pin<Box<dyn Stream<Item = Result<ChatChunk>> + Send>>> {
        Err(AiModelsError::UnsupportedOperation {
            operation: "chat_stream".to_string(),
            model: "anthropic".to_string(),
        })
    }
}
