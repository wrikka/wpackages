//! Google Vertex AI provider implementation
//!
//! This module provides the Google Vertex AI provider for AI models.

use crate::error::{AiModelsError, Result};
use crate::types::traits::{ChatModel, EmbeddingsModel, ModelProvider};
use crate::types::*;
use async_trait::async_trait;
use futures::Stream;
use reqwest::Client;
use serde_json::json;
use std::pin::Pin;

/// Google Vertex AI provider configuration
#[derive(Debug, Clone)]
pub struct VertexAIConfig {
    pub project_id: String,
    pub location: String,
    pub api_key: String,
    pub base_url: String,
    pub timeout: u64,
}

impl Default for VertexAIConfig {
    fn default() -> Self {
        Self {
            project_id: std::env::var("VERTEX_PROJECT_ID").unwrap_or_default(),
            location: std::env::var("VERTEX_LOCATION")
                .unwrap_or_else(|_| "us-central1".to_string()),
            api_key: std::env::var("VERTEX_API_KEY").unwrap_or_default(),
            base_url: "https://us-central1-aiplatform.googleapis.com/v1".to_string(),
            timeout: 30,
        }
    }
}

/// Google Vertex AI provider
pub struct VertexAIProvider {
    config: VertexAIConfig,
    client: Client,
}

impl VertexAIProvider {
    pub fn new(config: VertexAIConfig) -> Result<Self> {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout))
            .build()
            .map_err(|e| AiModelsError::NetworkError(e.to_string()))?;

        Ok(Self { config, client })
    }

    pub fn from_env() -> Result<Self> {
        Self::new(VertexAIConfig::default())
    }
}

#[async_trait]
impl ModelProvider for VertexAIProvider {
    fn name(&self) -> &str {
        "vertex_ai"
    }

    fn provider_type(&self) -> ProviderType {
        ProviderType::VertexAI
    }

    async fn is_ready(&self) -> Result<bool> {
        Ok(!self.config.project_id.is_empty() && !self.config.api_key.is_empty())
    }

    async fn list_models(&self) -> Result<Vec<ModelInfo>> {
        Ok(vec![
            ModelInfo {
                id: "gemini-pro".to_string(),
                provider: ProviderType::VertexAI,
                model_type: ModelType::Chat,
                display_name: "Gemini Pro".to_string(),
                description: Some("Google's flagship multimodal model, designed for a wide range of text and vision tasks.".to_string()),
                website: Some("https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini".to_string()),
                context_length: 32768,
                supports_chat: true,
                supports_completion: false,
                supports_embeddings: false,
                supports_streaming: true,
                pricing: Some(ModelPricing {
                    input_price_per_1k: 0.0005,
                    output_price_per_1k: 0.0015,
                    currency: "USD".to_string(),
                }),
            },
            ModelInfo {
                id: "gemini-pro-vision".to_string(),
                provider: ProviderType::VertexAI,
                model_type: ModelType::Chat,
                display_name: "Gemini Pro Vision".to_string(),
                description: Some("A multimodal model that can understand information from text and visual modalities.".to_string()),
                website: Some("https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini".to_string()),
                context_length: 65536,
                supports_chat: true,
                supports_completion: false,
                supports_embeddings: false,
                supports_streaming: true,
                pricing: Some(ModelPricing {
                    input_price_per_1k: 0.0025,
                    output_price_per_1k: 0.0075,
                    currency: "USD".to_string(),
                }),
            },
            ModelInfo {
                id: "textembedding-gecko".to_string(),
                provider: ProviderType::VertexAI,
                model_type: ModelType::Embeddings,
                display_name: "Text Embedding Gecko".to_string(),
                description: Some("A model that generates text embeddings for semantic search, classification, and clustering.".to_string()),
                website: Some("https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/text-embedding".to_string()),
                context_length: 2048,
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
impl ChatModel for VertexAIProvider {
    async fn chat(&self, request: ChatRequest) -> Result<ChatResponse> {
        let url = format!(
            "{}/projects/{}/locations/{}/publishers/google/models/{}:generateContent",
            self.config.base_url, self.config.project_id, self.config.location, request.model
        );

        let mut contents = vec![];
        for msg in &request.messages {
            match msg.role {
                MessageRole::User => {
                    contents.push(json!({"role": "user", "parts": [{"text": msg.content}]}));
                }
                MessageRole::Assistant => {
                    contents.push(json!({"role": "model", "parts": [{"text": msg.content}]}));
                }
                MessageRole::System => {
                    contents.insert(0, json!({"role": "user", "parts": [{"text": format!("System: {}", msg.content)}]}));
                }
                _ => {}
            }
        }

        let payload = json!({
            "contents": contents,
            "generationConfig": {
                "temperature": request.temperature,
                "maxOutputTokens": request.max_tokens,
            }
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

        let text = json["candidates"]
            .as_array()
            .and_then(|c| c.first())
            .and_then(|c| c.get("content"))
            .and_then(|c| c.get("parts"))
            .and_then(|p| p.as_array())
            .and_then(|p| p.first())
            .and_then(|p| p.get("text"))
            .and_then(|t| t.as_str())
            .unwrap_or("")
            .to_string();

        Ok(ChatResponse {
            id: uuid::Uuid::new_v4().to_string(),
            object: "chat.completion".to_string(),
            created: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            model: request.model,
            choices: vec![ChatChoice {
                index: 0,
                message: Message::assistant(text),
                finish_reason: "stop".to_string(),
            }],
            usage: Usage {
                prompt_tokens: json["usageMetadata"]["promptTokenCount"]
                    .as_u64()
                    .unwrap_or(0) as u32,
                completion_tokens: json["usageMetadata"]["candidatesTokenCount"]
                    .as_u64()
                    .unwrap_or(0) as u32,
                total_tokens: json["usageMetadata"]["totalTokenCount"]
                    .as_u64()
                    .unwrap_or(0) as u32,
            },
        })
    }

    async fn chat_stream(
        &self,
        _request: ChatRequest,
    ) -> Result<Pin<Box<dyn Stream<Item = Result<ChatChunk>> + Send>>> {
        Err(AiModelsError::UnsupportedOperation {
            operation: "chat_stream".to_string(),
            model: "vertex_ai".to_string(),
        })
    }
}

#[async_trait]
impl EmbeddingsModel for VertexAIProvider {
    async fn embed(&self, request: EmbeddingsRequest) -> Result<EmbeddingsResponse> {
        let url = format!(
            "{}/projects/{}/locations/{}/publishers/google/models/{}:predict",
            self.config.base_url, self.config.project_id, self.config.location, request.model
        );

        let texts = match &request.input {
            EmbeddingsInput::Single(text) => vec![text.clone()],
            EmbeddingsInput::Multiple(texts) => texts.clone(),
        };

        let instances: Vec<serde_json::Value> =
            texts.iter().map(|t| json!({"content": t})).collect();

        let payload = json!({
            "instances": instances,
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

        let embeddings = json["predictions"]
            .as_array()
            .ok_or_else(|| AiModelsError::Serialization("Invalid embeddings response".to_string()))?
            .iter()
            .map(|v| {
                v.get("embeddings")
                    .and_then(|e| e.get("values"))
                    .and_then(|v| v.as_array())
                    .ok_or_else(|| AiModelsError::Serialization("Invalid embedding".to_string()))?
                    .iter()
                    .map(|v| Ok(v.as_f64().unwrap_or(0.0) as f32))
                    .collect::<Result<Vec<f32>>>()
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
                prompt_tokens: json["usageMetadata"]["promptTokenCount"]
                    .as_u64()
                    .unwrap_or(0) as u32,
                completion_tokens: 0,
                total_tokens: 0,
            },
        })
    }
}
