//! Stability AI provider implementation
//!
//! This module provides the Stability AI provider for AI models.

use crate::error::{AiModelsError, Result};
use crate::types::traits::{ChatModel, ImageModel, ModelProvider};
use crate::types::image::{Image, ImageRequest, ImageResponse};
use crate::types::*;
use async_trait::async_trait;
use futures::Stream;
use reqwest::Client;
use serde_json::json;
use std::pin::Pin;

/// Stability AI provider configuration
#[derive(Debug, Clone)]
pub struct StabilityAIConfig {
    pub api_key: String,
    pub base_url: String,
    pub timeout: u64,
}

impl Default for StabilityAIConfig {
    fn default() -> Self {
        Self {
            api_key: std::env::var("STABILITY_API_KEY").unwrap_or_default(),
            base_url: "https://api.stability.ai/v1".to_string(),
            timeout: 120,
        }
    }
}

/// Stability AI provider
pub struct StabilityAIProvider {
    config: StabilityAIConfig,
    client: Client,
}

impl StabilityAIProvider {
    pub fn new(config: StabilityAIConfig) -> Result<Self> {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout))
            .build()
            .map_err(|e| AiModelsError::NetworkError(e.to_string()))?;
        Ok(Self { config, client })
    }

    pub fn from_env() -> Result<Self> {
        Self::new(StabilityAIConfig::default())
    }
}

#[async_trait]
impl ModelProvider for StabilityAIProvider {
    fn name(&self) -> &str {
        "stability_ai"
    }

    fn provider_type(&self) -> ProviderType {
        ProviderType::StabilityAI
    }

    async fn is_ready(&self) -> Result<bool> {
        Ok(!self.config.api_key.is_empty())
    }

    async fn list_models(&self) -> Result<Vec<ModelInfo>> {
        Ok(vec![
            ModelInfo {
                id: "stable-diffusion-v2-1".to_string(),
                provider: ProviderType::StabilityAI,
                model_type: ModelType::Image,
                display_name: "Stable Diffusion 2.1".to_string(),
                description: Some("The latest Stable Diffusion model for image generation.".to_string()),
                website: Some("https://stability.ai/".to_string()),
                context_length: 0,
                supports_chat: false,
                supports_completion: false,
                supports_embeddings: false,
                supports_streaming: false,
                pricing: None,
            },
            ModelInfo {
                id: "stable-beluga-2".to_string(),
                provider: ProviderType::StabilityAI,
                model_type: ModelType::Chat,
                display_name: "Stable Beluga 2".to_string(),
                description: Some("A powerful language model for chat and instruction following.".to_string()),
                website: Some("https://stability.ai/".to_string()),
                context_length: 4096,
                supports_chat: true,
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
impl ImageModel for StabilityAIProvider {
    async fn generate_image(&self, request: ImageRequest) -> Result<ImageResponse> {
        let payload = json!({
            "text_prompts": [
                {
                    "text": request.prompt
                }
            ],
            "cfg_scale": 7,
            "height": request.height.unwrap_or(1024),
            "width": request.width.unwrap_or(1024),
            "samples": 1,
            "steps": request.steps.unwrap_or(30),
        });

        let response: serde_json::Value = self
            .client
            .post(&format!("{}/generation/{}/text-to-image", self.config.base_url, request.model))
            .header("Authorization", format!("Bearer {}", self.config.api_key))
            .header("Accept", "application/json")
            .json(&payload)
            .send()
            .await
            .map_err(|e| AiModelsError::NetworkError(e.to_string()))?
            .json()
            .await
            .map_err(|e| AiModelsError::Serialization(e.to_string()))?;

        let artifacts = response["artifacts"].as_array().ok_or_else(|| AiModelsError::ProviderError {
            provider: self.name().to_string(),
            source: anyhow::anyhow!("No artifacts in response"),
        })?;

        let images = artifacts
            .iter()
            .map(|artifact| {
                let b64_json = artifact["base64"].as_str().map(String::from);
                Image {
                    url: "".to_string(), // Stability AI returns base64, not a URL
                    b64_json,
                    revised_prompt: None,
                }
            })
            .collect();

        Ok(ImageResponse {
            created: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            data: images,
        })
    }
}

#[async_trait]
impl ChatModel for StabilityAIProvider {
    async fn chat(&self, _request: ChatRequest) -> Result<ChatResponse> {
        Err(AiModelsError::UnsupportedOperation {
            operation: "chat".to_string(),
            model: "stability_ai".to_string(),
        })
    }

    async fn chat_stream(
        &self,
        _request: ChatRequest,
    ) -> Result<Pin<Box<dyn Stream<Item = Result<ChatChunk>> + Send>>> {
        Err(AiModelsError::UnsupportedOperation {
            operation: "chat_stream".to_string(),
            model: "stability_ai".to_string(),
        })
    }
}
