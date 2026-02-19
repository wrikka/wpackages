//! ElevenLabs provider implementation
//!
//! This module provides the ElevenLabs provider for text-to-speech.

use crate::error::{AiModelsError, Result};
use crate::types::traits::{AudioModel, ModelProvider};
use crate::types::audio::{Audio, AudioRequest, AudioResponse};
use crate::types::*;
use async_trait::async_trait;
use reqwest::Client;
use serde_json::json;

/// ElevenLabs provider configuration
#[derive(Debug, Clone)]
pub struct ElevenLabsConfig {
    pub api_key: String,
    pub base_url: String,
    pub timeout: u64,
}

impl Default for ElevenLabsConfig {
    fn default() -> Self {
        Self {
            api_key: std::env::var("ELEVENLABS_API_KEY").unwrap_or_default(),
            base_url: "https://api.elevenlabs.io/v1".to_string(),
            timeout: 60,
        }
    }
}

/// ElevenLabs provider
pub struct ElevenLabsProvider {
    config: ElevenLabsConfig,
    client: Client,
}

impl ElevenLabsProvider {
    pub fn new(config: ElevenLabsConfig) -> Result<Self> {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout))
            .build()
            .map_err(|e| AiModelsError::NetworkError(e.to_string()))?;
        Ok(Self { config, client })
    }

    pub fn from_env() -> Result<Self> {
        Self::new(ElevenLabsConfig::default())
    }
}

#[async_trait]
impl ModelProvider for ElevenLabsProvider {
    fn name(&self) -> &str {
        "eleven_labs"
    }

    fn provider_type(&self) -> ProviderType {
        ProviderType::ElevenLabs
    }

    async fn is_ready(&self) -> Result<bool> {
        Ok(!self.config.api_key.is_empty())
    }

    async fn list_models(&self) -> Result<Vec<ModelInfo>> {
        // ElevenLabs has a more complex model/voice system. This is a simplified representation.
        Ok(vec![ModelInfo {
            id: "eleven_multilingual_v2".to_string(),
            provider: ProviderType::ElevenLabs,
            model_type: ModelType::Audio,
            display_name: "Eleven Multilingual v2".to_string(),
            description: Some("The latest multilingual model from ElevenLabs.".to_string()),
            website: Some("https://elevenlabs.io/".to_string()),
            context_length: 0,
            supports_chat: false,
            supports_completion: false,
            supports_embeddings: false,
            supports_streaming: false,
            pricing: None, // Pricing is usage-based
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
impl AudioModel for ElevenLabsProvider {
    async fn generate_audio(&self, request: AudioRequest) -> Result<AudioResponse> {
        let voice_id = "21m00Tcm4TlvDq8ikWAM"; // Default voice, can be customized
        let url = format!("{}/text-to-speech/{}", self.config.base_url, voice_id);

        let payload = json!({
            "text": request.prompt,
            "model_id": request.model,
        });

        let response = self
            .client
            .post(&url)
            .header("xi-api-key", &self.config.api_key)
            .header("Accept", "audio/mpeg")
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

        let audio_bytes = response.bytes().await.map_err(|e| AiModelsError::NetworkError(e.to_string()))?;
        let b64_json = base64::encode(&audio_bytes);

        Ok(AudioResponse {
            created: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            data: vec![Audio {
                url: "".to_string(), // Audio is returned as bytes
                b64_json: Some(b64_json),
            }],
        })
    }
}
