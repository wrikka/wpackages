//! Cohere provider implementation
//!
//! This module provides the Cohere provider for AI models.

use crate::error::{AiModelsError, Result};
use crate::types::traits::{ChatModel, EmbeddingsModel, ModelProvider};
use crate::types::*;
use async_trait::async_trait;
use futures::Stream;
use reqwest::Client;
use serde_json::json;
use std::pin::Pin;

/// Cohere provider configuration
#[derive(Debug, Clone)]
pub struct CohereConfig {
    pub api_key: String,
    pub base_url: String,
    pub timeout: u64,
}

impl Default for CohereConfig {
    fn default() -> Self {
        Self {
            api_key: std::env::var("COHERE_API_KEY").unwrap_or_default(),
            base_url: "https://api.cohere.ai/v1".to_string(),
            timeout: 30,
        }
    }
}

/// Cohere provider
pub struct CohereProvider {
    config: CohereConfig,
    client: Client,
}

impl CohereProvider {
    pub fn new(config: CohereConfig) -> Result<Self> {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout))
            .build()
            .map_err(|e| AiModelsError::NetworkError(e.to_string()))?;

        Ok(Self { config, client })
    }

    pub fn from_env() -> Result<Self> {
        Self::new(CohereConfig::default())
    }
}

#[async_trait]
impl ModelProvider for CohereProvider {
    fn name(&self) -> &str {
        "cohere"
    }

    fn provider_type(&self) -> ProviderType {
        ProviderType::Cohere
    }

    async fn is_ready(&self) -> Result<bool> {
        Ok(!self.config.api_key.is_empty())
    }

    async fn list_models(&self) -> Result<Vec<ModelInfo>> {
        Ok(vec![
            ModelInfo {
                id: "command".to_string(),
                provider: ProviderType::Cohere,
                model_type: ModelType::Chat,
                display_name: "Command".to_string(),
                description: Some("Cohere's flagship text generation model for business applications.".to_string()),
                website: Some("https://cohere.com/models".to_string()),
                context_length: 4096,
                supports_chat: true,
                supports_completion: false,
                supports_embeddings: false,
                supports_streaming: false,
                pricing: Some(ModelPricing {
                    input_price_per_1k: 0.0015,
                    output_price_per_1k: 0.002,
                    currency: "USD".to_string(),
                }),
            },
            ModelInfo {
                id: "command-light".to_string(),
                provider: ProviderType::Cohere,
                model_type: ModelType::Chat,
                display_name: "Command Light".to_string(),
                description: Some("A smaller and faster version of the Command model.".to_string()),
                website: Some("https://cohere.com/models".to_string()),
                context_length: 4096,
                supports_chat: true,
                supports_completion: false,
                supports_embeddings: false,
                supports_streaming: false,
                pricing: Some(ModelPricing {
                    input_price_per_1k: 0.0003,
                    output_price_per_1k: 0.0006,
                    currency: "USD".to_string(),
                }),
            },
            ModelInfo {
                id: "embed-english-v3.0".to_string(),
                provider: ProviderType::Cohere,
                model_type: ModelType::Embeddings,
                display_name: "Embed English v3".to_string(),
                description: Some("Model for semantic search, RAG, and classification.".to_string()),
                website: Some("https://cohere.com/models".to_string()),
                context_length: 512,
                supports_chat: false,
                supports_completion: false,
                supports_embeddings: true,
                supports_streaming: false,
                pricing: Some(ModelPricing {
                    input_price_per_1k: 0.0001,
                    output_price_per_1k: 0.0,
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
impl ChatModel for CohereProvider {
    async fn chat(&self, request: ChatRequest) -> Result<ChatResponse> {
        let url = format!("{}/chat", self.config.base_url);

        let mut messages = vec![];
        for msg in &request.messages {
            match msg.role {
                MessageRole::User => messages.push(json!({"role": "USER", "message": msg.content})),
                MessageRole::Assistant => {
                    messages.push(json!({"role": "CHATBOT", "message": msg.content}))
                }
                MessageRole::System => {
                    messages.push(json!({"role": "SYSTEM", "message": msg.content}))
                }
                _ => {}
            }
        }

        let payload = json!({
            "model": request.model,
            "message": messages.last().and_then(|m| m.get("message")).and_then(|m| m.as_str()).unwrap_or(""),
            "chat_history": &messages[..messages.len().saturating_sub(1)],
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

        Ok(ChatResponse {
            id: json["response_id"].as_str().unwrap_or("").to_string(),
            object: "chat.completion".to_string(),
            created: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            model: request.model,
            choices: vec![ChatChoice {
                index: 0,
                message: Message::assistant(json["text"].as_str().unwrap_or("").to_string()),
                finish_reason: "stop".to_string(),
            }],
            usage: Usage {
                prompt_tokens: json["meta"]["billed_units"]["input_tokens"]
                    .as_u64()
                    .unwrap_or(0) as u32,
                completion_tokens: json["meta"]["billed_units"]["output_tokens"]
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
            model: "cohere".to_string(),
        })
    }
}

#[async_trait]
impl EmbeddingsModel for CohereProvider {
    async fn embed(&self, request: EmbeddingsRequest) -> Result<EmbeddingsResponse> {
        let url = format!("{}/embed", self.config.base_url);

        let texts = match &request.input {
            EmbeddingsInput::Single(text) => vec![text.clone()],
            EmbeddingsInput::Multiple(texts) => texts.clone(),
        };

        let payload = json!({
            "model": request.model,
            "texts": texts,
            "input_type": "search_document",
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

        let embeddings = json["embeddings"]
            .as_array()
            .ok_or_else(|| AiModelsError::Serialization("Invalid embeddings response".to_string()))?
            .iter()
            .map(|v| {
                v.as_array()
                    .ok_or_else(|| AiModelsError::Serialization("Invalid embedding".to_string()))?
                    .iter()
                    .map(|v| Ok(v.as_f64().unwrap_or(0.0) as f32))
                    .collect()
            })
            .collect::<Result<Vec<Vec<f32>>>>()?;

        Ok(EmbeddingsResponse {
            object: "list".to_string(),
            data: embeddings
                .iter()
                .enumerate()
                .map(|(i, emb)| EmbeddingData {
                    index: i as u32,
                    object: "embedding".to_string(),
                    embedding: emb.clone(),
                })
                .collect(),
            model: request.model,
            usage: Usage {
                prompt_tokens: json["meta"]["billed_units"]["input_tokens"]
                    .as_u64()
                    .unwrap_or(0) as u32,
                completion_tokens: 0,
                total_tokens: 0,
            },
        })
    }
}
