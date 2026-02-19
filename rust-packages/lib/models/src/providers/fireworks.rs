//! Fireworks AI provider implementation
//!
//! This module provides the Fireworks AI provider for AI models.

use crate::error::{AiModelsError, Result};
use crate::types::traits::{ChatModel, ModelProvider};
use crate::types::*;
use async_trait::async_trait;
use futures::{Stream, StreamExt};
use reqwest::Client;
use serde_json::json;
use std::pin::Pin;

/// Fireworks provider configuration
#[derive(Debug, Clone)]
pub struct FireworksConfig {
    pub api_key: String,
    pub base_url: String,
    pub timeout: u64,
}

impl Default for FireworksConfig {
    fn default() -> Self {
        Self {
            api_key: std::env::var("FIREWORKS_API_KEY").unwrap_or_default(),
            base_url: "https://api.fireworks.ai/inference/v1".to_string(),
            timeout: 30,
        }
    }
}

impl FireworksConfig {
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

/// Fireworks provider
pub struct FireworksProvider {
    config: FireworksConfig,
    client: Client,
}

impl FireworksProvider {
    pub fn new(config: FireworksConfig) -> Self {
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
impl ModelProvider for FireworksProvider {
    fn name(&self) -> &str {
        "fireworks"
    }

    fn provider_type(&self) -> ProviderType {
        ProviderType::Fireworks
    }

    async fn is_ready(&self) -> Result<bool> {
        if self.config.api_key.is_empty() {
            return Ok(false);
        }
        Ok(true)
    }

    async fn list_models(&self) -> Result<Vec<ModelInfo>> {
        let response = self
            .client
            .get(&format!("{}/models", self.config.base_url))
            .headers(self.get_headers())
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(AiModelsError::ProviderError {
                provider: "fireworks".to_string(),
                source: anyhow::anyhow!("Failed to list models: {}", response.status()),
            });
        }

        let data: serde_json::Value = response.json().await?;
        let models = data["data"]
            .as_array()
            .ok_or_else(|| AiModelsError::InvalidInput("Invalid models response".to_string()))?;

        Ok(models
            .iter()
            .filter_map(|m| {
                let id = m["id"].as_str()?;
                let model_type = if id.contains("embed") {
                    ModelType::Embeddings
                } else if id.contains("stable-diffusion") {
                    ModelType::Image
                } else {
                    ModelType::Chat
                };

                Some(ModelInfo {
                    id: id.to_string(),
                    provider: ProviderType::Fireworks,
                    model_type,
                    display_name: id.to_string(),
                    description: Some("A model hosted on Fireworks AI.".to_string()),
                    website: Some("https://fireworks.ai/".to_string()),
                    context_length: 32768, // A reasonable default for many models
                    supports_chat: model_type == ModelType::Chat,
                    supports_completion: false,
                    supports_embeddings: model_type == ModelType::Embeddings,
                    supports_streaming: model_type == ModelType::Chat,
                    pricing: None,
                })
            })
            .collect())
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
impl ChatModel for FireworksProvider {
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
            return Err(AiModelsError::ProviderError {
                provider: "fireworks".to_string(),
                source: anyhow::anyhow!("Chat request failed: {} - {}", status, error_text),
            });
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
                provider: "fireworks".to_string(),
                source: anyhow::anyhow!("Stream request failed: {}", response.status()),
            });
        }

        let stream = response.bytes_stream().map(|result| {
            result
                .map_err(AiModelsError::ReqwestError)
                .and_then(|bytes| {
                    let text = String::from_utf8_lossy(bytes.as_ref());
                    let mut chunk_to_return = None;
                    for line in text.lines() {
                        if line.starts_with("data: ") {
                            let data = &line[6..];
                            if data == "[DONE]" {
                                break;
                            }
                            if let Ok(chunk) = serde_json::from_str::<ChatChunk>(data) {
                                chunk_to_return = Some(Ok(chunk));
                                break;
                            }
                        }
                    }
                    chunk_to_return.unwrap_or_else(|| {
                        Err(AiModelsError::StreamError(
                            "Stream processing failed: invalid data chunk".to_string(),
                        ))
                    })
                })
        });

        Ok(Box::pin(stream))
    }
}
