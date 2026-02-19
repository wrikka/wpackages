//! HuggingFace provider implementation
//!
//! This module provides the HuggingFace provider for AI models via Inference API.

use crate::error::{AiModelsError, Result};
use crate::types::traits::{ChatModel, CompletionModel, EmbeddingsModel, ModelProvider};
use crate::types::*;
use async_trait::async_trait;
use futures::Stream;
use reqwest::Client;
use serde_json::json;
use std::pin::Pin;

/// HuggingFace provider configuration
#[derive(Debug, Clone)]
pub struct HuggingFaceConfig {
    pub api_key: String,
    pub base_url: String,
    pub timeout: u64,
}

impl Default for HuggingFaceConfig {
    fn default() -> Self {
        Self {
            api_key: std::env::var("HUGGINGFACE_API_KEY").unwrap_or_default(),
            base_url: "https://api-inference.huggingface.co/models".to_string(),
            timeout: 30,
        }
    }
}

/// HuggingFace provider
pub struct HuggingFaceProvider {
    config: HuggingFaceConfig,
    client: Client,
}

impl HuggingFaceProvider {
    pub fn new(config: HuggingFaceConfig) -> Result<Self> {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout))
            .build()
            .map_err(|e| AiModelsError::NetworkError(e.to_string()))?;

        Ok(Self { config, client })
    }

    pub fn from_env() -> Result<Self> {
        Self::new(HuggingFaceConfig::default())
    }

    async fn post_request(&self, url: &str, payload: serde_json::Value) -> Result<serde_json::Value> {
        let mut req_builder = self.client.post(url);
        if !self.config.api_key.is_empty() {
            req_builder = req_builder.header("Authorization", format!("Bearer {}", self.config.api_key));
        }

        let response = req_builder
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

        response
            .json()
            .await
            .map_err(|e| AiModelsError::Serialization(e.to_string()))
    }
}

#[async_trait]
impl ModelProvider for HuggingFaceProvider {
    fn name(&self) -> &str {
        "huggingface"
    }

    fn provider_type(&self) -> ProviderType {
        ProviderType::HuggingFace
    }

    async fn is_ready(&self) -> Result<bool> {
        Ok(!self.config.api_key.is_empty())
    }

    async fn list_models(&self) -> Result<Vec<ModelInfo>> {
        Ok(vec![
            ModelInfo {
                id: "meta-llama/Llama-2-7b-chat-hf".to_string(),
                provider: ProviderType::HuggingFace,
                model_type: ModelType::Chat,
                display_name: "Llama 2 7B Chat".to_string(),
                description: Some("Llama 2 is a collection of pretrained and fine-tuned large language models (LLMs) ranging in scale from 7 billion to 70 billion parameters.".to_string()),
                website: Some("https://huggingface.co/meta-llama/Llama-2-7b-chat-hf".to_string()),
                context_length: 4096,
                supports_chat: true,
                supports_completion: false,
                supports_embeddings: false,
                supports_streaming: false,
                pricing: None,
            },
            ModelInfo {
                id: "mistralai/Mistral-7B-Instruct-v0.2".to_string(),
                provider: ProviderType::HuggingFace,
                model_type: ModelType::Chat,
                display_name: "Mistral 7B Instruct".to_string(),
                description: Some("The Mistral-7B-Instruct-v0.2 Large Language Model (LLM) is an improved instruct fine-tuned version of Mistral-7B-Instruct-v0.1.".to_string()),
                website: Some("https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2".to_string()),
                context_length: 8192,
                supports_chat: true,
                supports_completion: false,
                supports_embeddings: false,
                supports_streaming: false,
                pricing: None,
            },
            ModelInfo {
                id: "sentence-transformers/all-MiniLM-L6-v2".to_string(),
                provider: ProviderType::HuggingFace,
                model_type: ModelType::Embeddings,
                display_name: "All MiniLM L6 v2".to_string(),
                description: Some("This is a sentence-transformers model: It maps sentences & paragraphs to a 384 dimensional dense vector space and can be used for tasks like clustering or semantic search.".to_string()),
                website: Some("https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2".to_string()),
                context_length: 512,
                supports_chat: false,
                supports_completion: false,
                supports_embeddings: true,
                supports_streaming: false,
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
impl ChatModel for HuggingFaceProvider {
    async fn chat(&self, request: ChatRequest) -> Result<ChatResponse> {
        let url = format!("{}/{}", self.config.base_url, request.model);

        let last_message = request
            .messages
            .iter()
            .find(|m| m.role == MessageRole::User);
        let prompt = last_message.map(|m| m.content.as_str()).unwrap_or("");

        let payload = json!({
            "inputs": prompt,
            "parameters": {
                "temperature": request.temperature,
                "max_new_tokens": request.max_tokens,
            }
        });

        let json = self.post_request(&url, payload).await?;

        let generated_text = if let Some(array) = json.as_array() {
            array
                .first()
                .and_then(|v| v.get("generated_text"))
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string()
        } else {
            json.get("generated_text")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string()
        };

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
                message: Message::assistant(generated_text),
                finish_reason: "stop".to_string(),
            }],
            usage: Usage {
                prompt_tokens: 0,
                completion_tokens: 0,
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
            model: "huggingface".to_string(),
        })
    }
}

#[async_trait]
impl CompletionModel for HuggingFaceProvider {
    async fn complete(&self, request: CompletionRequest) -> Result<CompletionResponse> {
        let url = format!("{}/{}", self.config.base_url, request.model);

        let payload = json!({
            "inputs": request.prompt,
            "parameters": {
                "temperature": request.temperature,
                "max_new_tokens": request.max_tokens,
            }
        });

        let json = self.post_request(&url, payload).await?;

        let generated_text = if let Some(array) = json.as_array() {
            array
                .first()
                .and_then(|v| v.get("generated_text"))
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string()
        } else {
            json.get("generated_text")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string()
        };

        Ok(CompletionResponse {
            id: uuid::Uuid::new_v4().to_string(),
            object: "text_completion".to_string(),
            created: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            model: request.model,
            choices: vec![CompletionChoice {
                index: 0,
                text: generated_text,
                finish_reason: Some("stop".to_string()),
            }],
            usage: Usage {
                prompt_tokens: 0,
                completion_tokens: 0,
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
            model: "huggingface".to_string(),
        })
    }
}

#[async_trait]
impl EmbeddingsModel for HuggingFaceProvider {
    async fn embed(&self, request: EmbeddingsRequest) -> Result<EmbeddingsResponse> {
        let url = format!("{}/{}", self.config.base_url, request.model);

        let texts = match &request.input {
            EmbeddingsInput::Single(text) => vec![text.clone()],
            EmbeddingsInput::Multiple(texts) => texts.clone(),
        };

        let payload = json!({
            "inputs": texts,
        });

        let mut req_builder = self.client.post(&url);
        if !self.config.api_key.is_empty() {
            req_builder =
                req_builder.header("Authorization", format!("Bearer {}", self.config.api_key));
        }

        let response = req_builder
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

        let embeddings = if let Some(array) = json.as_array() {
            array
                .iter()
                .map(|v| {
                    v.as_array()
                        .ok_or_else(|| {
                            AiModelsError::Serialization("Invalid embedding".to_string())
                        })?
                        .iter()
                        .map(|v| Ok(v.as_f64().unwrap_or(0.0) as f32))
                        .collect()
                })
                .collect::<Result<Vec<Vec<f32>>>>()?
        } else {
            vec![vec![]]
        };

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
                prompt_tokens: 0,
                completion_tokens: 0,
                total_tokens: 0,
            },
        })
    }
}
