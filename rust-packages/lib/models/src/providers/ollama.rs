//! Ollama provider implementation
//!
//! This module provides the Ollama provider for local AI models.

use crate::error::{AiModelsError, Result};
use crate::types::traits::{ChatModel, CompletionModel, EmbeddingsModel, ModelProvider};
use crate::types::*;
use async_trait::async_trait;
use futures::Stream;
use reqwest::Client;
use serde_json::json;
use std::pin::Pin;

/// Ollama provider configuration
#[derive(Debug, Clone)]
pub struct OllamaConfig {
    pub base_url: String,
    pub timeout: u64,
}

impl Default for OllamaConfig {
    fn default() -> Self {
        Self {
            base_url: "http://localhost:11434".to_string(),
            timeout: 120,
        }
    }
}

impl OllamaConfig {
    pub fn new(base_url: impl Into<String>) -> Self {
        Self {
            base_url: base_url.into(),
            ..Default::default()
        }
    }

    pub fn with_timeout(mut self, timeout: u64) -> Self {
        self.timeout = timeout;
        self
    }
}

/// Ollama provider
pub struct OllamaProvider {
    config: OllamaConfig,
    client: Client,
}

impl OllamaProvider {
    pub fn new(config: OllamaConfig) -> Self {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout))
            .build()
            .expect("Failed to create HTTP client");

        Self { config, client }
    }

    fn get_headers(&self) -> reqwest::header::HeaderMap {
        let mut headers = reqwest::header::HeaderMap::new();
        headers.insert(
            reqwest::header::CONTENT_TYPE,
            reqwest::header::HeaderValue::from_static("application/json"),
        );
        headers
    }
}

#[async_trait]
impl ModelProvider for OllamaProvider {
    fn name(&self) -> &str {
        "ollama"
    }

    fn provider_type(&self) -> ProviderType {
        ProviderType::Ollama
    }

    async fn is_ready(&self) -> Result<bool> {
        let response = self
            .client
            .get(&format!("{}/api/tags", self.config.base_url))
            .send()
            .await;

        match response {
            Ok(r) => Ok(r.status().is_success()),
            Err(_) => Ok(false),
        }
    }

    async fn list_models(&self) -> Result<Vec<ModelInfo>> {
        let response = self
            .client
            .get(&format!("{}/api/tags", self.config.base_url))
            .headers(self.get_headers())
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(AiModelsError::ProviderError {
                provider: "ollama".to_string(),
                source: anyhow::anyhow!("Failed to list models: {}", response.status()),
            });
        }

        let data: serde_json::Value = response.json().await?;
        let models = data["models"]
            .as_array()
            .ok_or_else(|| AiModelsError::InvalidInput("Invalid models response".to_string()))?;

        Ok(models
            .iter()
            .filter_map(|m| {
                let name = m["name"].as_str()?;
                Some(ModelInfo {
                    id: name.to_string(),
                    provider: ProviderType::Ollama,
                    model_type: ModelType::Chat,
                    display_name: name.to_string(),
                    description: Some("A local model served by Ollama.".to_string()),
                    website: Some("https://ollama.com/".to_string()),
                    context_length: 4096,
                    supports_chat: true,
                    supports_completion: true,
                    supports_embeddings: false,
                    supports_streaming: true,
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
impl ChatModel for OllamaProvider {
    async fn chat(&self, request: ChatRequest) -> Result<ChatResponse> {
        let url = format!("{}/api/chat", self.config.base_url);

        let messages: Vec<serde_json::Value> = request
            .messages
            .iter()
            .map(|m| {
                json!({
                    "role": match m.role {
                        MessageRole::System => "system",
                        MessageRole::User => "user",
                        MessageRole::Assistant => "assistant",
                        MessageRole::Tool => "user",
                    },
                    "content": m.content,
                })
            })
            .collect();

        let request_body = json!({
            "model": request.model,
            "messages": messages,
            "stream": false,
            "options": {
                "temperature": request.temperature,
                "num_predict": request.max_tokens,
                "top_p": request.top_p,
            }
        });

        let response = self
            .client
            .post(&url)
            .headers(self.get_headers())
            .json(&request_body)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(AiModelsError::ProviderError {
                provider: "ollama".to_string(),
                source: anyhow::anyhow!("Chat request failed: {}", response.status()),
            });
        }

        let ollama_response: serde_json::Value = response.json().await?;

        let content = ollama_response["message"]["content"]
            .as_str()
            .ok_or_else(|| AiModelsError::InvalidInput("Invalid response format".to_string()))?;

        Ok(ChatResponse {
            id: ollama_response["id"].as_str().unwrap_or("").to_string(),
            object: "chat.completion".to_string(),
            created: ollama_response["created_at"].as_u64().unwrap_or(0),
            model: request.model,
            choices: vec![ChatChoice {
                index: 0,
                message: Message::assistant(content),
                finish_reason: ollama_response["done_reason"]
                    .as_str()
                    .unwrap_or("stop")
                    .to_string(),
            }],
            usage: Usage {
                prompt_tokens: ollama_response["prompt_eval_count"].as_u64().unwrap_or(0) as u32,
                completion_tokens: ollama_response["eval_count"].as_u64().unwrap_or(0) as u32,
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
            model: "ollama".to_string(),
        })
    }
}

#[async_trait]
impl CompletionModel for OllamaProvider {
    async fn complete(&self, request: CompletionRequest) -> Result<CompletionResponse> {
        let url = format!("{}/api/generate", self.config.base_url);

        let request_body = json!({
            "model": request.model,
            "prompt": request.prompt,
            "stream": false,
            "options": {
                "temperature": request.temperature,
                "num_predict": request.max_tokens,
                "top_p": request.top_p,
            }
        });

        let response = self
            .client
            .post(&url)
            .headers(self.get_headers())
            .json(&request_body)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(AiModelsError::ProviderError {
                provider: "ollama".to_string(),
                source: anyhow::anyhow!("Completion request failed: {}", response.status()),
            });
        }

        let ollama_response: serde_json::Value = response.json().await?;

        let text = ollama_response["response"]
            .as_str()
            .ok_or_else(|| AiModelsError::InvalidInput("Invalid response format".to_string()))?;

        Ok(CompletionResponse {
            id: ollama_response["id"].as_str().unwrap_or("").to_string(),
            object: "text_completion".to_string(),
            created: ollama_response["created_at"].as_u64().unwrap_or(0),
            model: request.model,
            choices: vec![CompletionChoice {
                index: 0,
                text: text.to_string(),
                finish_reason: Some(
                    ollama_response["done_reason"]
                        .as_str()
                        .unwrap_or("stop")
                        .to_string(),
                ),
            }],
            usage: Usage {
                prompt_tokens: ollama_response["prompt_eval_count"].as_u64().unwrap_or(0) as u32,
                completion_tokens: ollama_response["eval_count"].as_u64().unwrap_or(0) as u32,
                total_tokens: 0,
            },
        })
    }

    async fn complete_stream(
        &self,
        _request: CompletionRequest,
    ) -> Result<Pin<Box<dyn Stream<Item = Result<CompletionChunk>> + Send>>> {
        Err(AiModelsError::UnsupportedOperation {
            operation: "complete_stream".to_string(),
            model: "ollama".to_string(),
        })
    }
}

#[async_trait]
impl EmbeddingsModel for OllamaProvider {
    async fn embed(&self, _request: EmbeddingsRequest) -> Result<EmbeddingsResponse> {
        Err(AiModelsError::UnsupportedOperation {
            operation: "embed".to_string(),
            model: "ollama".to_string(),
        })
    }
}
