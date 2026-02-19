//! Amazon Bedrock provider implementation
//!
//! This module provides the Amazon Bedrock provider for AI models.

use crate::error::{AiModelsError, Result};
use crate::types::traits::{ChatModel, CompletionModel, EmbeddingsModel, ModelProvider};
use crate::types::*;
use async_trait::async_trait;
use aws_config::meta::region::RegionProviderChain;
use aws_sdk_bedrockruntime::Client as BedrockClient;
use futures::{Stream, StreamExt};
use reqwest::Client;
use serde_json::json;
use std::pin::Pin;

/// Bedrock provider configuration
#[derive(Debug, Clone)]
pub struct BedrockConfig {
    pub aws_access_key_id: String,
    pub aws_secret_access_key: String,
    pub aws_region: String,
    pub timeout: u64,
}

impl BedrockConfig {
    /// Creates a new configuration from environment variables.
    pub fn from_env() -> Result<Self> {
        let aws_access_key_id = std::env::var("AWS_ACCESS_KEY_ID").map_err(|_| {
            AiModelsError::ConfigurationError("AWS_ACCESS_KEY_ID not found".to_string())
        })?;
        let aws_secret_access_key = std::env::var("AWS_SECRET_ACCESS_KEY").map_err(|_| {
            AiModelsError::ConfigurationError("AWS_SECRET_ACCESS_KEY not found".to_string())
        })?;
        let aws_region = std::env::var("AWS_REGION").unwrap_or_else(|_| "us-east-1".to_string());

        Ok(Self {
            aws_access_key_id,
            aws_secret_access_key,
            aws_region,
            timeout: 30,
        })
    }

    pub fn new(
        access_key: impl Into<String>,
        secret_key: impl Into<String>,
        region: impl Into<String>,
    ) -> Self {
        Self {
            aws_access_key_id: access_key.into(),
            aws_secret_access_key: secret_key.into(),
            aws_region: region.into(),
            timeout: 30,
        }
    }

    pub fn with_timeout(mut self, timeout: u64) -> Self {
        self.timeout = timeout;
        self
    }
}

/// Bedrock provider
pub struct BedrockProvider {
    config: BedrockConfig,
    client: Client,
    bedrock_client: BedrockClient,
}

impl BedrockProvider {
    pub async fn new(config: BedrockConfig) -> Result<Self> {
        let region_provider =
            RegionProviderChain::default_provider().or_else(config.aws_region.clone());
        let aws_config = aws_config::from_env().region(region_provider).load().await;
        let bedrock_client = BedrockClient::new(&aws_config);

        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout))
            .build()
            .map_err(|e| AiModelsError::initialization_error(e))?;

        Ok(Self {
            config,
            client,
            bedrock_client,
        })
    }

    // TODO: Implement AWS Signature V4 signing for raw reqwest calls if needed.
    // For Bedrock-specific calls, the aws_sdk_bedrockruntime::Client handles this automatically.
    fn sign_request(&self) -> reqwest::header::HeaderMap {
        reqwest::header::HeaderMap::new()
    }
}

#[async_trait]
impl ModelProvider for BedrockProvider {
    fn name(&self) -> &str {
        "bedrock"
    }

    fn provider_type(&self) -> ProviderType {
        ProviderType::Bedrock
    }

    async fn is_ready(&self) -> Result<bool> {
        // Initialization in `new` now handles configuration checks.
        Ok(true)
    }

    async fn list_models(&self) -> Result<Vec<ModelInfo>> {
        // TODO: Implement actual API call to Bedrock to list models
        Ok(vec![])
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
impl ChatModel for BedrockProvider {
    async fn chat(&self, _request: ChatRequest) -> Result<ChatResponse> {
        Err(AiModelsError::not_implemented(
            ProviderType::Bedrock,
            "chat",
        ))
    }

    async fn chat_stream(
        &self,
        _request: ChatRequest,
    ) -> Result<Pin<Box<dyn Stream<Item = Result<ChatChunk>> + Send>>> {
        Err(AiModelsError::not_implemented(
            ProviderType::Bedrock,
            "chat_stream",
        ))
    }
}

#[async_trait]
impl CompletionModel for BedrockProvider {
    async fn complete(&self, _request: CompletionRequest) -> Result<CompletionResponse> {
        Err(AiModelsError::not_implemented(
            ProviderType::Bedrock,
            "complete",
        ))
    }

    async fn complete_stream(
        &self,
        _request: CompletionRequest,
    ) -> Result<Pin<Box<dyn Stream<Item = Result<CompletionChunk>> + Send>>> {
        Err(AiModelsError::not_implemented(
            ProviderType::Bedrock,
            "complete_stream",
        ))
    }
}

#[async_trait]
impl EmbeddingsModel for BedrockProvider {
    async fn embed(&self, _request: EmbeddingsRequest) -> Result<EmbeddingsResponse> {
        Err(AiModelsError::not_implemented(
            ProviderType::Bedrock,
            "embed",
        ))
    }
}
