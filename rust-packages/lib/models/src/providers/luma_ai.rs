//! Luma AI provider implementation
//!
//! This module provides the Luma AI provider for 3D model generation.

use crate::error::{AiModelsError, Result};
use crate::types::traits::{ModelProvider, ThreeDModel};
use crate::types::three_d::{ThreeDRequest, ThreeDResponse, ThreeDModelData};
use crate::types::*;
use async_trait::async_trait;
use reqwest::Client;
use serde_json::json;
use tokio::time::{sleep, Duration};

/// Luma AI provider configuration
#[derive(Debug, Clone)]
pub struct LumaAIConfig {
    pub api_key: String,
    pub base_url: String,
    pub timeout: u64,
}

impl Default for LumaAIConfig {
    fn default() -> Self {
        Self {
            api_key: std::env::var("LUMA_API_KEY").unwrap_or_default(),
            base_url: "https://api.luma.ai/v1".to_string(),
            timeout: 300, // 3D generation can be slow
        }
    }
}

/// Luma AI provider
pub struct LumaAIProvider {
    config: LumaAIConfig,
    client: Client,
}

impl LumaAIProvider {
    pub fn new(config: LumaAIConfig) -> Result<Self> {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout))
            .build()
            .map_err(|e| AiModelsError::NetworkError(e.to_string()))?;
        Ok(Self { config, client })
    }

    pub fn from_env() -> Result<Self> {
        Self::new(LumaAIConfig::default())
    }
}

#[async_trait]
impl ModelProvider for LumaAIProvider {
    fn name(&self) -> &str {
        "luma_ai"
    }

    fn provider_type(&self) -> ProviderType {
        ProviderType::LumaAI
    }

    async fn is_ready(&self) -> Result<bool> {
        Ok(!self.config.api_key.is_empty())
    }

    async fn list_models(&self) -> Result<Vec<ModelInfo>> {
        Ok(vec![ModelInfo {
            id: "genie-2.0".to_string(),
            provider: ProviderType::LumaAI,
            model_type: ModelType::ThreeD,
            display_name: "Genie 2.0".to_string(),
            description: Some("Luma AI's text-to-3D generation model.".to_string()),
            website: Some("https://lumalabs.ai/".to_string()),
            context_length: 0,
            supports_chat: false,
            supports_completion: false,
            supports_embeddings: false,
            supports_streaming: false,
            pricing: None, // Pricing info not readily available
        }])
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
impl ThreeDModel for LumaAIProvider {
    async fn generate_3d(&self, request: ThreeDRequest) -> Result<ThreeDResponse> {
        let initial_payload = json!({
            "prompt": request.prompt,
        });

        let mut response: serde_json::Value = self
            .client
            .post(&format!("{}/imagine/generations", self.config.base_url))
            .header("Authorization", format!("Bearer {}", self.config.api_key))
            .json(&initial_payload)
            .send()
            .await
            .map_err(|e| AiModelsError::NetworkError(e.to_string()))?
            .json()
            .await
            .map_err(|e| AiModelsError::Serialization(e.to_string()))?;

        let generation_id = response[0]["id"].as_str().ok_or_else(|| {
            AiModelsError::ProviderError {
                provider: self.name().to_string(),
                source: anyhow::anyhow!("Missing generation ID in response"),
            }
        })?;

        loop {
            let get_url = format!("{}/imagine/generations/{}", self.config.base_url, generation_id);
            response = self
                .client
                .get(&get_url)
                .header("Authorization", format!("Bearer {}", self.config.api_key))
                .send()
                .await
                .map_err(|e| AiModelsError::NetworkError(e.to_string()))?
                .json()
                .await
                .map_err(|e| AiModelsError::Serialization(e.to_string()))?;

            let status = response["state"].as_str().unwrap_or("");
            match status {
                "completed" => {
                    let model_data = response["artifacts"]
                        .as_array()
                        .and_then(|a| a.first())
                        .and_then(|a| a.get("url"))
                        .and_then(|u| u.as_str())
                        .map(|url| ThreeDModelData {
                            url: url.to_string(),
                            b64_json: None,
                            revised_prompt: None,
                        })
                        .ok_or_else(|| AiModelsError::ProviderError {
                            provider: self.name().to_string(),
                            source: anyhow::anyhow!("Could not extract model URL from response"),
                        })?;

                    return Ok(ThreeDResponse {
                        created: response["created_at_epoch"].as_u64().unwrap_or(0),
                        data: vec![model_data],
                    });
                }
                "failed" => {
                    return Err(AiModelsError::ProviderError {
                        provider: self.name().to_string(),
                        source: anyhow::anyhow!("3D model generation failed."),
                    });
                }
                _ => {
                    sleep(Duration::from_secs(5)).await;
                }
            }
        }
    }
}
