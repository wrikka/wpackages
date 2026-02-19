//! HTTP model service for real API calls

use std::time::Duration;
use async_trait::async_trait;

use crate::error::{EvalError, EvalResult};
use super::service::ModelService;
use super::info::ModelInfo;

/// HTTP model service
pub struct HttpModelService {
    client: reqwest::Client,
    api_endpoint: String,
    api_key: Option<String>,
    model_name: String,
    max_retries: u32,
}

impl HttpModelService {
    /// Create a new HTTP model service
    pub fn new(
        api_endpoint: String,
        api_key: Option<String>,
        model_name: String,
    ) -> Self {
        Self {
            client: reqwest::Client::new(),
            api_endpoint,
            api_key,
            model_name,
            max_retries: 3,
        }
    }

    /// Set max retries
    pub fn with_max_retries(mut self, max_retries: u32) -> Self {
        self.max_retries = max_retries;
        self
    }

    /// Make HTTP request with retries
    async fn make_request_with_retries(&self, input: &str) -> EvalResult<String> {
        let mut last_error = None;

        for attempt in 0..=self.max_retries {
            match self.make_single_request(input).await {
                Ok(response) => return Ok(response),
                Err(e) => {
                    last_error = Some(e);
                    if attempt < self.max_retries {
                        // Exponential backoff
                        let delay_ms = 1000 * (2_u64.pow(attempt));
                        tokio::time::sleep(Duration::from_millis(delay_ms)).await;
                    }
                }
            }
        }

        Err(last_error.unwrap_or_else(|| EvalError::model_error("Unknown error")))
    }

    /// Make single HTTP request
    async fn make_single_request(&self, input: &str) -> EvalResult<String> {
        let mut request = self.client
            .post(&self.api_endpoint)
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({
                "model": self.model_name,
                "messages": [{"role": "user", "content": input}],
                "max_tokens": 1000,
                "temperature": 0.7
            }));

        if let Some(api_key) = &self.api_key {
            request = request.header("Authorization", format!("Bearer {}", api_key));
        }

        let response = request
            .send()
            .await
            .map_err(|e| EvalError::model_error(format!("HTTP request failed: {}", e)))?;

        if !response.status().is_success() {
            return Err(EvalError::model_error(
                format!("API request failed with status: {}", response.status())
            ));
        }

        let response_text = response
            .text()
            .await
            .map_err(|e| EvalError::model_error(format!("Failed to read response: {}", e)))?;

        // Parse response (assuming OpenAI-like format)
        let response_json: serde_json::Value = serde_json::from_str(&response_text)
            .map_err(|e| EvalError::model_error(format!("Failed to parse response: {}", e)))?;

        let content = response_json
            .get("choices")
            .and_then(|choices| choices.get(0))
            .and_then(|choice| choice.get("message"))
            .and_then(|message| message.get("content"))
            .and_then(|content| content.as_str())
            .ok_or_else(|| EvalError::model_error("Invalid response format"))?;

        Ok(content.to_string())
    }
}

#[async_trait]
impl ModelService for HttpModelService {
    async fn generate_response(&self, input: &str) -> EvalResult<String> {
        if input.is_empty() {
            return Err(EvalError::model_error("Input cannot be empty"));
        }

        self.make_request_with_retries(input).await
    }

    async fn get_model_info(&self) -> EvalResult<ModelInfo> {
        Ok(ModelInfo::new(
            self.model_name.clone(),
            "unknown".to_string(),
            vec!["text-generation".to_string()],
        ))
    }
}
