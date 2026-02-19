//! Google Gemini provider implementation

use crate::error::{AiModelsError, Result};
use crate::types::traits::{ChatModel, ModelProvider};
use crate::types::*;
use async_trait::async_trait;
use reqwest::Client;
use serde::{Deserialize, Serialize};

// Custom structs for Gemini API
#[derive(Serialize)]
struct GeminiRequest {
    contents: Vec<Content>,
}

#[derive(Serialize)]
struct Content {
    parts: Vec<Part>,
}

#[derive(Serialize)]
struct Part {
    text: String,
}

#[derive(Deserialize)]
struct GeminiResponse {
    candidates: Vec<Candidate>,
}

#[derive(Deserialize)]
struct Candidate {
    content: ContentResponse,
}

#[derive(Deserialize)]
struct ContentResponse {
    parts: Vec<PartResponse>,
}

#[derive(Deserialize)]
struct PartResponse {
    text: String,
}

/// Google Gemini provider configuration
#[derive(Debug, Clone)]
pub struct GoogleGeminiConfig {
    pub api_key: String,
    pub model: String,
    pub timeout: u64,
}

impl GoogleGeminiConfig {
    pub fn new(api_key: impl Into<String>, model: impl Into<String>) -> Self {
        Self {
            api_key: api_key.into(),
            model: model.into(),
            timeout: 60,
        }
    }
}

/// Google Gemini provider
pub struct GoogleGeminiProvider {
    config: GoogleGeminiConfig,
    client: Client,
}

impl GoogleGeminiProvider {
    pub fn new(config: GoogleGeminiConfig) -> Self {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout))
            .build()
            .expect("Failed to create HTTP client");
        Self { config, client }
    }

    fn get_url(&self) -> String {
        format!(
            "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
            self.config.model,
            self.config.api_key
        )
    }
}

#[async_trait]
impl ModelProvider for GoogleGeminiProvider {
    fn name(&self) -> &str {
        "google_gemini"
    }

    fn provider_type(&self) -> ProviderType {
        ProviderType::GoogleGemini
    }
}

#[async_trait]
impl ChatModel for GoogleGeminiProvider {
    async fn chat(&self, request: ChatRequest) -> Result<ChatResponse> {
        let url = self.get_url();
        let parts: Vec<Part> = request.messages.into_iter().map(|m| Part { text: m.content.to_string() }).collect();
        let gemini_request = GeminiRequest { contents: vec![Content { parts }] };

        let response = self.client.post(&url).json(&gemini_request).send().await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(AiModelsError::ProviderError {
                provider: self.name().to_string(),
                source: anyhow::anyhow!("Chat request failed: {} - {}", status, error_text),
            });
        }

        let gemini_response: GeminiResponse = response.json().await?;

        let content = gemini_response.candidates.get(0)
            .and_then(|c| c.content.parts.get(0))
            .map(|p| p.text.clone())
            .unwrap_or_default();

        let chat_response = ChatResponse {
            id: "gemini-response".to_string(),
            object: "chat.completion".to_string(),
            created: std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs(),
            model: self.config.model.clone(),
            choices: vec![ChatChoice {
                index: 0,
                message: Message::assistant(content),
                finish_reason: "stop".to_string(),
            }],
            usage: Usage::default(), // Gemini API does not provide token usage in the same way
        };

        Ok(chat_response)
    }
}
