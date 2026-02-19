//! Replicate provider implementation
//!
//! This module provides the Replicate provider for AI models.

use crate::error::{AiModelsError, Result};
use crate::types::traits::{ChatModel, CompletionModel, EmbeddingsModel, ModelProvider};
use crate::types::*;
use async_trait::async_trait;
use futures::Stream;
use reqwest::Client;
use serde_json::json;
use std::pin::Pin;
use std::time::Duration;
use tokio::time::sleep;

/// Replicate provider configuration
#[derive(Debug, Clone)]
pub struct ReplicateConfig {
    pub api_key: String,
    pub base_url: String,
    pub timeout: u64,
}

impl Default for ReplicateConfig {
    fn default() -> Self {
        Self {
            api_key: std::env::var("REPLICATE_API_TOKEN").unwrap_or_default(),
            base_url: "https://api.replicate.com/v1".to_string(),
            timeout: 60,
        }
    }
}

/// Replicate provider
pub struct ReplicateProvider {
    config: ReplicateConfig,
    client: Client,
}

impl ReplicateProvider {
    pub fn new(config: ReplicateConfig) -> Result<Self> {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout))
            .build()
            .map_err(|e| AiModelsError::NetworkError(e.to_string()))?;

        Ok(Self { config, client })
    }

    pub fn from_env() -> Result<Self> {
        Self::new(ReplicateConfig::default())
    }

}

#[async_trait]
impl ModelProvider for ReplicateProvider {
    fn name(&self) -> &str {
        "replicate"
    }

    fn provider_type(&self) -> ProviderType {
        ProviderType::Replicate
    }

    async fn is_ready(&self) -> Result<bool> {
        Ok(!self.config.api_key.is_empty())
    }

    async fn list_models(&self) -> Result<Vec<ModelInfo>> {
        Ok(vec![
            // Chat Models
            ModelInfo {
                id: "meta/llama-2-70b-chat".to_string(),
                provider: ProviderType::Replicate,
                model_type: ModelType::Chat,
                display_name: "Llama 2 70B Chat".to_string(),
                description: Some("The Llama 2 70B chat model, fine-tuned for dialogue use cases.".to_string()),
                website: Some("https://replicate.com/meta/llama-2-70b-chat".to_string()),
                context_length: 4096,
                supports_chat: true,
                supports_completion: false,
                supports_embeddings: false,
                supports_streaming: true,
                pricing: None,
            },
            ModelInfo {
                id: "mistralai/mistral-7b-instruct-v0.2".to_string(),
                provider: ProviderType::Replicate,
                model_type: ModelType::Chat,
                display_name: "Mistral 7B Instruct v0.2".to_string(),
                description: Some("The Mistral 7B Instruct model, fine-tuned for instruction-following.".to_string()),
                website: Some("https://replicate.com/mistralai/mistral-7b-instruct-v0.2".to_string()),
                context_length: 8192,
                supports_chat: true,
                supports_completion: false,
                supports_embeddings: false,
                supports_streaming: true,
                pricing: None,
            },
            // Embeddings Models
            ModelInfo {
                id: "nateraw/bert-base-uncased".to_string(),
                provider: ProviderType::Replicate,
                model_type: ModelType::Embeddings,
                display_name: "BERT Base Uncased".to_string(),
                description: Some("BERT base model (uncased) for text embeddings.".to_string()),
                website: Some("https://replicate.com/nateraw/bert-base-uncased".to_string()),
                context_length: 512,
                supports_chat: false,
                supports_completion: false,
                supports_embeddings: true,
                supports_streaming: false,
                pricing: None,
            },
            // Image Models
            ModelInfo {
                id: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b".to_string(),
                provider: ProviderType::Replicate,
                model_type: ModelType::Image,
                display_name: "Stable Diffusion XL".to_string(),
                description: Some("Stable Diffusion XL (SDXL) is a powerful text-to-image generation model.".to_string()),
                website: Some("https://replicate.com/stability-ai/sdxl".to_string()),
                context_length: 0,
                supports_chat: false,
                supports_completion: false,
                supports_embeddings: false,
                supports_streaming: false,
                pricing: None,
            },
            // Video Models
            ModelInfo {
                id: "anotherjesse/zeroscope-v2-xl:9f747673744c618e444e042098823e8841aa685aa75276de812ac1ade07c515d".to_string(),
                provider: ProviderType::Replicate,
                model_type: ModelType::Video,
                display_name: "Zeroscope V2 XL".to_string(),
                description: Some("A text-to-video model for generating high-quality video clips.".to_string()),
                website: Some("https://replicate.com/anotherjesse/zeroscope-v2-xl".to_string()),
                context_length: 0,
                supports_chat: false,
                supports_completion: false,
                supports_embeddings: false,
                supports_streaming: false,
                pricing: None,
            },
            // Audio Models
            ModelInfo {
                id: "meta/musicgen:b05b1dff1d8c6dc63d42c5d0238ce93e254d369f90de122d5f1735009f4e927f".to_string(),
                provider: ProviderType::Replicate,
                model_type: ModelType::Audio,
                display_name: "MusicGen".to_string(),
                description: Some("A state-of-the-art controllable text-to-music model.".to_string()),
                website: Some("https://replicate.com/meta/musicgen".to_string()),
                context_length: 0,
                supports_chat: false,
                supports_completion: false,
                supports_embeddings: false,
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
impl ChatModel for ReplicateProvider {
    async fn chat(&self, request: ChatRequest) -> Result<ChatResponse> {
        let url = format!("{}/predictions", self.config.base_url);

        let last_message = request
            .messages
            .iter()
            .find(|m| m.role == MessageRole::User);
        let prompt = last_message.map(|m| m.content.as_str()).unwrap_or("");

        let payload = json!({
            "version": request.model,
            "input": {
                "prompt": prompt,
                "temperature": request.temperature,
                "max_new_tokens": request.max_tokens,
            }
        });

        let response = self
            .client
            .post(&url)
            .header("Authorization", format!("Token {}", self.config.api_key))
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

        let output = json["output"]
            .as_array()
            .and_then(|a| a.first())
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();

        Ok(ChatResponse {
            id: json["id"].as_str().unwrap_or("").to_string(),
            object: "chat.completion".to_string(),
            created: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            model: request.model,
            choices: vec![ChatChoice {
                index: 0,
                message: Message::assistant(output),
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
            model: "replicate".to_string(),
        })
    }
}

#[async_trait]
impl CompletionModel for ReplicateProvider {
    async fn complete(&self, request: CompletionRequest) -> Result<CompletionResponse> {
        let url = format!("{}/predictions", self.config.base_url);

        let payload = json!({
            "version": request.model,
            "input": {
                "prompt": request.prompt,
                "temperature": request.temperature,
                "max_new_tokens": request.max_tokens,
            }
        });

        let response = self
            .client
            .post(&url)
            .header("Authorization", format!("Token {}", self.config.api_key))
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

        let output = json["output"]
            .as_array()
            .and_then(|a| a.first())
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();

        Ok(CompletionResponse {
            id: json["id"].as_str().unwrap_or("").to_string(),
            object: "text_completion".to_string(),
            created: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            model: request.model,
            choices: vec![CompletionChoice {
                index: 0,
                text: output,
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
            model: "replicate".to_string(),
        })
    }
}

async fn run_and_poll_prediction(
    client: &Client,
    base_url: &str,
    api_key: &str,
    version: &str,
    input: serde_json::Value,
) -> Result<serde_json::Value> {
    let initial_payload = json!({
        "version": version,
        "input": input
    });

    let mut response: serde_json::Value = client
        .post(&format!("{}/predictions", base_url))
        .header("Authorization", format!("Token {}", api_key))
        .header("Content-Type", "application/json")
        .json(&initial_payload)
        .send()
        .await
        .map_err(|e| AiModelsError::NetworkError(e.to_string()))?
        .json()
        .await
        .map_err(|e| AiModelsError::Serialization(e.to_string()))?;

    let get_url = response["urls"]["get"].as_str().ok_or_else(|| {
        AiModelsError::ProviderError {
            provider: "replicate".to_string(),
            source: anyhow::anyhow!("Missing get URL in prediction response"),
        }
    })?;

    loop {
        let status = response["status"].as_str().unwrap_or("");
        match status {
            "succeeded" => return Ok(response["output"].clone()),
            "failed" | "canceled" => {
                return Err(AiModelsError::ProviderError {
                    provider: "replicate".to_string(),
                    source: anyhow::anyhow!(
                        "Prediction failed with status '{}': {}",
                        status,
                        response["error"].to_string()
                    ),
                });
            }
            _ => {
                sleep(Duration::from_secs(1)).await;
                response = client
                    .get(get_url)
                    .header("Authorization", format!("Token {}", api_key))
                    .send()
                    .await
                    .map_err(|e| AiModelsError::NetworkError(e.to_string()))?
                    .json()
                    .await
                    .map_err(|e| AiModelsError::Serialization(e.to_string()))?;
            }
        }
    }
}

#[async_trait]
impl ImageModel for ReplicateProvider {
    async fn generate_image(&self, request: ImageRequest) -> Result<ImageResponse> {
        let input = json!({ "prompt": request.prompt });
        let output = run_and_poll_prediction(
            &self.client,
            &self.config.base_url,
            &self.config.api_key,
            &request.model,
            input,
        )
        .await?;

        let image_urls: Vec<String> = if let Some(arr) = output.as_array() {
            arr.iter()
                .filter_map(|v| v.as_str().map(String::from))
                .collect()
        } else {
            vec![]
        };

        Ok(ImageResponse {
            created: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            data: image_urls
                .into_iter()
                .map(|url| Image {
                    url,
                    b64_json: None,
                    revised_prompt: None,
                })
                .collect(),
        })
    }
}

#[async_trait]
impl VideoModel for ReplicateProvider {
    async fn generate_video(&self, request: VideoRequest) -> Result<VideoResponse> {
        let input = json!({ "prompt": request.prompt });
        let output = run_and_poll_prediction(
            &self.client,
            &self.config.base_url,
            &self.config.api_key,
            &request.model,
            input,
        )
        .await?;

        let video_urls: Vec<String> = if let Some(arr) = output.as_array() {
            arr.iter()
                .filter_map(|v| v.as_str().map(String::from))
                .collect()
        } else if let Some(url) = output.as_str() {
            vec![url.to_string()]
        } else {
            vec![]
        };

        Ok(VideoResponse {
            created: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            data: video_urls
                .into_iter()
                .map(|url| Video {
                    url,
                    b64_json: None,
                    revised_prompt: None,
                })
                .collect(),
        })
    }
}

#[async_trait]
impl AudioModel for ReplicateProvider {
    async fn generate_audio(&self, request: AudioRequest) -> Result<AudioResponse> {
        let input = json!({ "prompt": request.prompt });
        let output = run_and_poll_prediction(
            &self.client,
            &self.config.base_url,
            &self.config.api_key,
            &request.model,
            input,
        )
        .await?;

        let audio_url = output.as_str().map(String::from).unwrap_or_default();

        Ok(AudioResponse {
            created: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            data: vec![Audio {
                url: audio_url,
                b64_json: None,
            }],
        })
    }
}

#[async_trait]
impl EmbeddingsModel for ReplicateProvider {
    async fn embed(&self, request: EmbeddingsRequest) -> Result<EmbeddingsResponse> {
        let url = format!("{}/predictions", self.config.base_url);

        let texts = match &request.input {
            EmbeddingsInput::Single(text) => vec![text.clone()],
            EmbeddingsInput::Multiple(texts) => texts.clone(),
        };

        let payload = json!({
            "version": request.model,
            "input": {
                "text": texts.first().unwrap_or(&String::new()),
            }
        });

        let response = self
            .client
            .post(&url)
            .header("Authorization", format!("Token {}", self.config.api_key))
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

        let embedding = json["output"]
            .as_array()
            .map(|a| a.iter().map(|v| v.as_f64().unwrap_or(0.0) as f32).collect())
            .unwrap_or(vec![]);

        Ok(EmbeddingsResponse {
            object: "list".to_string(),
            data: vec![EmbeddingData {
                index: 0,
                object: "embedding".to_string(),
                embedding,
            }],
            model: request.model.clone(),
            usage: Usage {
                prompt_tokens: 0,
                completion_tokens: 0,
                total_tokens: 0,
            },
        })
    }
}
