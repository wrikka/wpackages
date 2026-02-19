//! Suno AI provider implementation
//!
//! This module provides the Suno AI provider for music generation.

use crate::error::{AiModelsError, Result};
use crate::types::traits::{ModelProvider, MusicModel};
use crate::types::music::{MusicData, MusicRequest, MusicResponse};
use crate::types::*;
use async_trait::async_trait;
use reqwest::Client;
use serde_json::json;
use tokio::time::{sleep, Duration};

/// Suno AI provider configuration
#[derive(Debug, Clone)]
pub struct SunoAIConfig {
    pub api_key: String,
    pub base_url: String,
    pub timeout: u64,
}

impl Default for SunoAIConfig {
    fn default() -> Self {
        Self {
            api_key: std::env::var("SUNO_API_KEY").unwrap_or_default(),
            base_url: "https://api.suno.ai".to_string(),
            timeout: 300, // Music generation can be slow
        }
    }
}

/// Suno AI provider
pub struct SunoAIProvider {
    config: SunoAIConfig,
    client: Client,
}

impl SunoAIProvider {
    pub fn new(config: SunoAIConfig) -> Result<Self> {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout))
            .build()
            .map_err(|e| AiModelsError::NetworkError(e.to_string()))?;
        Ok(Self { config, client })
    }

    pub fn from_env() -> Result<Self> {
        Self::new(SunoAIConfig::default())
    }
}

#[async_trait]
impl ModelProvider for SunoAIProvider {
    fn name(&self) -> &str {
        "suno_ai"
    }

    fn provider_type(&self) -> ProviderType {
        ProviderType::SunoAI
    }

    async fn is_ready(&self) -> Result<bool> {
        Ok(!self.config.api_key.is_empty())
    }

    async fn list_models(&self) -> Result<Vec<ModelInfo>> {
        Ok(vec![ModelInfo {
            id: "chirp-v3-0".to_string(),
            provider: ProviderType::SunoAI,
            model_type: ModelType::Music,
            display_name: "Chirp v3".to_string(),
            description: Some("Suno's text-to-music generation model.".to_string()),
            website: Some("https://suno.ai/".to_string()),
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
impl MusicModel for SunoAIProvider {
    async fn generate_music(&self, request: MusicRequest) -> Result<MusicResponse> {
        let initial_payload = json!({
            "prompt": request.prompt,
            "make_instrumental": false,
            "wait_audio": false,
        });

        let response: serde_json::Value = self
            .client
            .post(&format!("{}/api/generate", self.config.base_url))
            .header("Authorization", format!("Bearer {}", self.config.api_key))
            .json(&initial_payload)
            .send()
            .await
            .map_err(|e| AiModelsError::NetworkError(e.to_string()))?
            .json()
            .await
            .map_err(|e| AiModelsError::Serialization(e.to_string()))?;

        let clip_id = response["clips"][0]["id"].as_str().ok_or_else(|| {
            AiModelsError::ProviderError {
                provider: self.name().to_string(),
                source: anyhow::anyhow!("Missing clip ID in response"),
            }
        })?;

        loop {
            let get_url = format!("{}/api/feed/{}", self.config.base_url, clip_id);
            let feed_response: serde_json::Value = self
                .client
                .get(&get_url)
                .header("Authorization", format!("Bearer {}", self.config.api_key))
                .send()
                .await
                .map_err(|e| AiModelsError::NetworkError(e.to_string()))?
                .json()
                .await
                .map_err(|e| AiModelsError::Serialization(e.to_string()))?;

            let status = feed_response[0]["status"].as_str().unwrap_or("");
            match status {
                "complete" => {
                    let audio_url = feed_response[0]["audio_url"].as_str().ok_or_else(|| {
                        AiModelsError::ProviderError {
                            provider: self.name().to_string(),
                            source: anyhow::anyhow!("Missing audio URL in response"),
                        }
                    })?;

                    return Ok(MusicResponse {
                        created: std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap()
                            .as_secs(),
                        data: vec![MusicData {
                            url: audio_url.to_string(),
                            b64_json: None,
                        }],
                    });
                }
                "failed" => {
                    return Err(AiModelsError::ProviderError {
                        provider: self.name().to_string(),
                        source: anyhow::anyhow!("Music generation failed."),
                    });
                }
                _ => {
                    sleep(Duration::from_secs(5)).await;
                }
            }
        }
    }
}
