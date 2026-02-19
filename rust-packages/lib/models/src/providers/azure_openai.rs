//! Azure OpenAI provider implementation

use crate::error::{AiModelsError, Result};
use crate::types::traits::{ChatModel, ModelProvider};
use crate::types::*;
use async_trait::async_trait;
use reqwest::Client;
use serde_json::json;

/// Azure OpenAI provider configuration
#[derive(Debug, Clone)]
pub struct AzureOpenAIConfig {
    pub api_key: String,
    pub endpoint: String,
    pub deployment_name: String,
    pub timeout: u64,
}

impl AzureOpenAIConfig {
    pub fn new(api_key: impl Into<String>, endpoint: impl Into<String>, deployment_name: impl Into<String>) -> Self {
        Self {
            api_key: api_key.into(),
            endpoint: endpoint.into(),
            deployment_name: deployment_name.into(),
            timeout: 30,
        }
    }
}

/// Azure OpenAI provider
pub struct AzureOpenAIProvider {
    config: AzureOpenAIConfig,
    client: Client,
}

impl AzureOpenAIProvider {
    pub fn new(config: AzureOpenAIConfig) -> Self {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout))
            .build()
            .expect("Failed to create HTTP client");
        Self { config, client }
    }

    fn get_headers(&self) -> reqwest::header::HeaderMap {
        let mut headers = reqwest::header::HeaderMap::new();
        headers.insert("api-key", self.config.api_key.parse().unwrap());
        headers.insert(
            reqwest::header::CONTENT_TYPE,
            reqwest::header::HeaderValue::from_static("application/json"),
        );
        headers
    }

    fn get_url(&self) -> String {
        format!(
            "{}/openai/deployments/{}/chat/completions?api-version=2024-02-01",
            self.config.endpoint,
            self.config.deployment_name
        )
    }
}

#[async_trait]
impl ModelProvider for AzureOpenAIProvider {
    fn name(&self) -> &str {
        "azure_openai"
    }

    fn provider_type(&self) -> ProviderType {
        ProviderType::AzureOpenAI
    }
}

#[async_trait]
impl ChatModel for AzureOpenAIProvider {
    async fn chat(&self, request: ChatRequest) -> Result<ChatResponse> {
        let url = self.get_url();
        let mut request_body = serde_json::to_value(&request)?;
        request_body["stream"] = json!(false);

        let response = self
            .client
            .post(&url)
            .headers(self.get_headers())
            .json(&request_body)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(AiModelsError::ProviderError {
                provider: self.name().to_string(),
                source: anyhow::anyhow!("Chat request failed: {} - {}", status, error_text),
            });
        }

        let response: ChatResponse = response.json().await?;
        Ok(response)
    }
}
