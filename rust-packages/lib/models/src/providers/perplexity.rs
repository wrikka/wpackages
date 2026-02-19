//! Perplexity AI provider implementation
//!
//! This module provides the Perplexity AI provider for AI models.

use crate::error::{AiModelsError, Result};
use crate::types::traits::{ChatModel, ModelProvider};
use crate::types::*;
use async_trait::async_trait;
use futures::{Stream, StreamExt};
use reqwest::Client;
use serde_json::json;
use std::pin::Pin;

/// Perplexity provider configuration
#[derive(Debug, Clone)]
pub struct PerplexityConfig {
    pub api_key: String,
    pub base_url: String,
    pub timeout: u64,
}

impl Default for PerplexityConfig {
    fn default() -> Self {
        Self {
            api_key: std::env::var("PERPLEXITY_API_KEY").unwrap_or_default(),
            base_url: "https://api.perplexity.ai".to_string(),
            timeout: 30,
        }
    }
}

impl PerplexityConfig {
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

/// Perplexity provider
pub struct PerplexityProvider {
    config: PerplexityConfig,
    client: Client,
}

impl PerplexityProvider {
    pub fn new(config: PerplexityConfig) -> Self {
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
impl ModelProvider for PerplexityProvider {
    fn name(&self) -> &str {
        "perplexity"
    }

    fn provider_type(&self) -> ProviderType {
        ProviderType::Perplexity
    }

    async fn is_ready(&self) -> Result<bool> {
        if self.config.api_key.is_empty() {
            return Ok(false);
        }
        Ok(true)
    }

    async fn list_models(&self) -> Result<Vec<ModelInfo>> {
        // Perplexity API does not have a public endpoint to list models.
        // We will return a hardcoded list of known models.
        let models = vec![
            ModelInfo {
                id: "sonar-small-chat".to_string(),
                provider: ProviderType::Perplexity,
                model_type: ModelType::Chat,
                display_name: "Sonar Small Chat".to_string(),
                description: Some("Sonar Small is Perplexity's fastest and most cost-effective model, designed for applications requiring quick responses.".to_string()),
                website: Some("https://www.perplexity.ai/".to_string()),
                context_length: 16384,
                supports_chat: true,
                supports_completion: false,
                supports_embeddings: false,
                supports_streaming: true,
                pricing: None, // Add pricing info if available
            },
            ModelInfo {
                id: "sonar-medium-chat".to_string(),
                provider: ProviderType::Perplexity,
                model_type: ModelType::Chat,
                display_name: "Sonar Medium Chat".to_string(),
                description: Some("Sonar Medium is Perplexity's balanced model, offering a blend of performance and speed for a wide range of applications.".to_string()),
                website: Some("https://www.perplexity.ai/".to_string()),
                context_length: 16384,
                supports_chat: true,
                supports_completion: false,
                supports_embeddings: false,
                supports_streaming: true,
                pricing: None, // Add pricing info if available
            },
        ];
        Ok(models)
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
impl ChatModel for PerplexityProvider {
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
                provider: "perplexity".to_string(),
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
                provider: "perplexity".to_string(),
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
