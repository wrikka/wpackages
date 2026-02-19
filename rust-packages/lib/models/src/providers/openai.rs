//! OpenAI provider implementation
//!
//! This module provides the OpenAI provider for AI models.

use crate::error::{AiModelsError, Result};
use crate::types::fine_tuning::{CreateFineTuningJobRequest, FineTuningJob};
use crate::types::image::{ImageRequest, ImageResponse};
use crate::types::moderation::{ModerationRequest, ModerationResponse};
use crate::types::traits::{ChatModel, CompletionModel, EmbeddingsModel, FineTuningModel, ImageModel, ModerationModel, ModelProvider};
use crate::types::*;
use async_trait::async_trait;
use futures::{Stream, StreamExt};
use reqwest::Client;
use serde_json::json;
use std::pin::Pin;

/// OpenAI provider configuration
#[derive(Debug, Clone)]
pub struct OpenAIConfig {
    pub api_key: String,
    pub base_url: String,
    pub timeout: u64,
}

impl Default for OpenAIConfig {
    fn default() -> Self {
        Self {
            api_key: std::env::var("OPENAI_API_KEY").unwrap_or_default(),
            base_url: "https://api.openai.com/v1".to_string(),
            timeout: 30,
        }
    }
}

impl OpenAIConfig {
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

/// OpenAI provider
pub struct OpenAIProvider {
    config: OpenAIConfig,
    client: Client,
}

impl OpenAIProvider {
    pub fn new(config: OpenAIConfig) -> Self {
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
impl ModelProvider for OpenAIProvider {
    fn name(&self) -> &str {
        "openai"
    }

    fn provider_type(&self) -> ProviderType {
        ProviderType::OpenAI
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
                provider: "openai".to_string(),
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
                let description = match id {
                    _ if id.starts_with("gpt-4o") => Some("OpenAI's most advanced, multimodal model that’s 2x faster than GPT-4 Turbo.".to_string()),
                    _ if id.starts_with("gpt-4-turbo") => Some("The latest GPT-4 model with improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more.".to_string()),
                    _ if id.starts_with("gpt-4") => Some("A set of models that improve on GPT-3.5 and can understand as well as generate natural language or code.".to_string()),
                    _ if id.starts_with("gpt-3.5-turbo") => Some("A set of models that improve on GPT-3 and can understand as well as generate natural language or code.".to_string()),
                    _ if id.starts_with("dall-e") => Some("An AI system that can create realistic images and art from a description in natural language.".to_string()),
                    _ if id.starts_with("tts") => Some("A text-to-speech model that can generate human-like audio from text.".to_string()),
                    _ if id.starts_with("whisper") => Some("A speech-to-text model that can transcribe audio into text.".to_string()),
                    _ if id.starts_with("text-embedding") => Some("A model that can convert text into a numerical representation.".to_string()),
                    _ => None,
                };

                let context_length = match id {
                    _ if id.starts_with("gpt-4") => 128000,
                    _ if id.starts_with("gpt-3.5-turbo") => 16385,
                    _ => 8192, // Default for others
                };

                Some(ModelInfo {
                    id: id.to_string(),
                    provider: ProviderType::OpenAI,
                    model_type: if id.contains("text-embedding") {
                        ModelType::Embeddings
                    } else if id.starts_with("dall-e") {
                        ModelType::Image
                    } else if id.starts_with("gpt") {
                        ModelType::Chat
                    } else {
                        ModelType::Completion
                    },
                    display_name: id.to_string(),
                    description,
                    website: Some("https://openai.com/".to_string()),
                    context_length,
                    supports_chat: id.contains("gpt"),
                    supports_completion: id.contains("gpt-3"),
                    supports_embeddings: id.contains("text-embedding"),
                    supports_streaming: id.contains("gpt"),
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
impl ChatModel for OpenAIProvider {
    async fn chat(&self, request: ChatRequest) -> Result<ChatResponse> {
        let url = format!("{}/chat/completions", self.config.base_url);

        let mut request_body = serde_json::to_value(&request)?;

        // Ensure stream is false for non-streaming
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
                    provider: "openai".to_string(),
                })
            } else {
                Err(AiModelsError::ProviderError {
                    provider: "openai".to_string(),
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
                provider: "openai".to_string(),
                source: anyhow::anyhow!("Stream request failed: {}", response.status()),
            });
        }

        let stream = response.bytes_stream().map(|result| {
            result
                .map_err(AiModelsError::ReqwestError)
                .and_then(|bytes| {
                    let text = String::from_utf8_lossy(bytes.as_ref());
                    // Parse SSE format
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

#[async_trait]
impl CompletionModel for OpenAIProvider {
    async fn complete(&self, request: CompletionRequest) -> Result<CompletionResponse> {
        let url = format!("{}/completions", self.config.base_url);

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
            return Err(AiModelsError::ProviderError {
                provider: "openai".to_string(),
                source: anyhow::anyhow!("Completion request failed: {}", response.status()),
            });
        }

        let response: CompletionResponse = response.json().await?;
        Ok(response)
    }

    async fn complete_stream(
        &self,
        request: CompletionRequest,
    ) -> Result<Pin<Box<dyn Stream<Item = Result<CompletionChunk>> + Send>>> {
        let url = format!("{}/completions", self.config.base_url);

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
                provider: "openai".to_string(),
                source: anyhow::anyhow!("Stream request failed: {}", response.status()),
            });
        }

        let stream = response.bytes_stream().map(|result| {
            result
                .map_err(AiModelsError::ReqwestError)
                .and_then(|bytes| {
                    let text = String::from_utf8_lossy(&bytes);
                    for line in text.lines() {
                        if line.starts_with("data: ") {
                            let data = &line[6..];
                            if data == "[DONE]" {
                                break;
                            }
                            if let Ok(chunk) = serde_json::from_str::<CompletionChunk>(data) {
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

#[async_trait]
impl EmbeddingsModel for OpenAIProvider {
    async fn embed(&self, request: EmbeddingsRequest) -> Result<EmbeddingsResponse> {
        let url = format!("{}/embeddings", self.config.base_url);

        let response = self
            .client
            .post(&url)
            .headers(self.get_headers())
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(AiModelsError::ProviderError {
                provider: "openai".to_string(),
                source: anyhow::anyhow!("Embeddings request failed: {}", response.status()),
            });
        }

        let response: EmbeddingsResponse = response.json().await?;
        Ok(response)
    }
}

#[async_trait]
impl FineTuningModel for OpenAIProvider {
    async fn create_fine_tuning_job(&self, request: CreateFineTuningJobRequest) -> Result<FineTuningJob> {
        let url = format!("{}/fine_tuning/jobs", self.config.base_url);
        let response = self
            .client
            .post(&url)
            .headers(self.get_headers())
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(AiModelsError::ProviderError {
                provider: self.name().to_string(),
                source: anyhow::anyhow!("Create fine-tuning job failed: {} - {}", status, error_text),
            });
        }

        let job: FineTuningJob = response.json().await?;
        Ok(job)
    }

    async fn list_fine_tuning_jobs(&self) -> Result<Vec<FineTuningJob>> {
        let url = format!("{}/fine_tuning/jobs", self.config.base_url);
        let response = self.client.get(&url).headers(self.get_headers()).send().await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(AiModelsError::ProviderError {
                provider: self.name().to_string(),
                source: anyhow::anyhow!("List fine-tuning jobs failed: {} - {}", status, error_text),
            });
        }

        let response: serde_json::Value = response.json().await?;
        let jobs: Vec<FineTuningJob> = serde_json::from_value(response["data"].clone())?;
        Ok(jobs)
    }

    async fn retrieve_fine_tuning_job(&self, job_id: &str) -> Result<FineTuningJob> {
        let url = format!("{}/fine_tuning/jobs/{}", self.config.base_url, job_id);
        let response = self.client.get(&url).headers(self.get_headers()).send().await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(AiModelsError::ProviderError {
                provider: self.name().to_string(),
                source: anyhow::anyhow!("Retrieve fine-tuning job failed: {} - {}", status, error_text),
            });
        }

        let job: FineTuningJob = response.json().await?;
        Ok(job)
    }

    async fn cancel_fine_tuning_job(&self, job_id: &str) -> Result<FineTuningJob> {
        let url = format!("{}/fine_tuning/jobs/{}/cancel", self.config.base_url, job_id);
        let response = self.client.post(&url).headers(self.get_headers()).send().await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(AiModelsError::ProviderError {
                provider: self.name().to_string(),
                source: anyhow::anyhow!("Cancel fine-tuning job failed: {} - {}", status, error_text),
            });
        }

        let job: FineTuningJob = response.json().await?;
        Ok(job)
    }
}

#[async_trait]
impl ModerationModel for OpenAIProvider {
    async fn moderate(&self, request: ModerationRequest) -> Result<ModerationResponse> {
        let url = format!("{}/moderations", self.config.base_url);
        let response = self
            .client
            .post(&url)
            .headers(self.get_headers())
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(AiModelsError::ProviderError {
                provider: self.name().to_string(),
                source: anyhow::anyhow!("Moderation request failed: {} - {}", status, error_text),
            });
        }

        let response: ModerationResponse = response.json().await?;
        Ok(response)
    }
}

#[async_trait]
impl ImageModel for OpenAIProvider {
    async fn generate_image(&self, request: ImageRequest) -> Result<ImageResponse> {
        let url = format!("{}/images/generations", self.config.base_url);

        let response = self
            .client
            .post(&url)
            .headers(self.get_headers())
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(AiModelsError::ProviderError {
                provider: self.name().to_string(),
                source: anyhow::anyhow!("Image generation failed: {} - {}", status, error_text),
            });
        }

        let response: ImageResponse = response.json().await?;
        Ok(response)
    }
}
