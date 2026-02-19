//! Groq provider implementation
//!
//! This module provides the Groq provider for fast AI inference.

use crate::error::{AiModelsError, Result};
use crate::types::traits::{ChatModel, ModelProvider};
use crate::types::*;
use async_trait::async_trait;
use futures::{Stream, StreamExt};
use reqwest::Client;
use serde_json::json;
use std::pin::Pin;

/// Groq provider configuration
#[derive(Debug, Clone)]
pub struct GroqConfig {
    pub api_key: String,
    pub base_url: String,
    pub timeout: u64,
}

impl Default for GroqConfig {
    fn default() -> Self {
        Self {
            api_key: std::env::var("GROQ_API_KEY").unwrap_or_default(),
            base_url: "https://api.groq.com/openai/v1".to_string(),
            timeout: 30,
        }
    }
}

impl GroqConfig {
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

/// Groq provider
pub struct GroqProvider {
    config: GroqConfig,
    client: Client,
}

impl GroqProvider {
    pub fn new(config: GroqConfig) -> Self {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout))
            .build()
            .expect("Failed to create HTTP client");

        Self { config, client }
    }

    fn get_headers(&self) -> reqwest::header::HeaderMap {
        let mut headers = reqwest::header::HeaderMap::new();
        headers.insert(
            reqwest::header::AUTHORIZATION,
            format!("Bearer {}", self.config.api_key).parse().unwrap(),
        );
        headers.insert(
            reqwest::header::CONTENT_TYPE,
            reqwest::header::HeaderValue::from_static("application/json"),
        );
        headers
    }
}

#[async_trait]
impl ModelProvider for GroqProvider {
    fn name(&self) -> &str {
        "groq"
    }

    fn provider_type(&self) -> ProviderType {
        ProviderType::Groq
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
                id: "llama3-70b-8192".to_string(),
                provider: ProviderType::Groq,
                model_type: ModelType::Chat,
                display_name: "Llama3 70B".to_string(),
                description: Some("The 70B parameter Llama 3 model.".to_string()),
                website: Some("https://groq.com/".to_string()),
                context_length: 8192,
                supports_chat: true,
                supports_completion: false,
                supports_embeddings: false,
                supports_streaming: true,
                pricing: None,
            },
            ModelInfo {
                id: "mixtral-8x7b-32768".to_string(),
                provider: ProviderType::Groq,
                model_type: ModelType::Chat,
                display_name: "Mixtral 8x7B".to_string(),
                description: Some("A high-quality sparse mixture of experts model (SMoE) with open weights.".to_string()),
                website: Some("https://groq.com/".to_string()),
                context_length: 32768,
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
impl ChatModel for GroqProvider {
    async fn chat(&self, request: ChatRequest) -> Result<ChatResponse> {
        let url = format!("{}/chat/completions", self.config.base_url);

        let mut request_body = serde_json::to_value(&request)?;
        request_body["stream"] = json!(false);

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
                    provider: "groq".to_string(),
                })
            } else {
                Err(AiModelsError::ProviderError {
                    provider: "groq".to_string(),
                    source: anyhow::anyhow!("Chat request failed: {} - {}", status, error_text),
                })
            };
        }

        let response: ChatResponse = response.json().await?;
        Ok(response)
    }

    async fn chat_stream(
        &self,
        request: ChatRequest,
    ) -> Result<Pin<Box<dyn Stream<Item = Result<ChatChunk>> + Send>>> {
        let url = format!("{}/chat/completions", self.config.base_url);

        let mut request_body = serde_json::to_value(&request)?;
        request_body["stream"] = json!(true);

        let response = self
            .client
            .post(&url)
            .headers(self.get_headers())
            .json(&request_body)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(AiModelsError::ProviderError {
                provider: "groq".to_string(),
                source: anyhow::anyhow!("Stream request failed: {}", response.status()),
            });
        }

        let stream = response.bytes_stream().map(|result| {
            result
                .map_err(AiModelsError::ReqwestError)
                .and_then(|bytes| {
                    let text = String::from_utf8_lossy(bytes.as_ref());
                    for line in text.lines() {
                        if line.starts_with("data: ") {
                            let data = &line[6..];
                            if data == "[DONE]" {
                                break;
                            }
                            if let Ok(chunk) = serde_json::from_str::<ChatChunk>(data) {
                                return Ok(chunk);
                            }
                        }
                    }
                    Err(AiModelsError::StreamError("No valid chunk".to_string()))
                })
        });

        Ok(Box::pin(stream))
    }
}
