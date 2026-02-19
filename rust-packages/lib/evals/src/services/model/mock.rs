//! Mock model service for testing

use async_trait::async_trait;

use crate::error::{EvalError, EvalResult};
use super::service::ModelService;
use super::info::ModelInfo;

/// Default mock model service
pub struct MockModelService {
    model_name: String,
    response_delay_ms: u64,
}

impl MockModelService {
    /// Create a new mock model service
    pub fn new(model_name: String) -> Self {
        Self {
            model_name,
            response_delay_ms: 100,
        }
    }

    /// Set response delay for testing
    pub fn with_delay(mut self, delay_ms: u64) -> Self {
        self.response_delay_ms = delay_ms;
        self
    }

    /// Generate a mock response based on input
    fn generate_mock_response(&self, input: &str) -> String {
        // Simple mock response generation
        if input.to_lowercase().contains("hello") {
            "Hello! How can I help you today?".to_string()
        } else if input.to_lowercase().contains("test") {
            "This is a test response.".to_string()
        } else {
            format!("Mock response for: {}", input)
        }
    }
}

#[async_trait]
impl ModelService for MockModelService {
    async fn generate_response(&self, input: &str) -> EvalResult<String> {
        // Simulate network delay
        tokio::time::sleep(std::time::Duration::from_millis(self.response_delay_ms)).await;

        if input.is_empty() {
            return Err(EvalError::model_error("Input cannot be empty"));
        }

        Ok(self.generate_mock_response(input))
    }

    async fn get_model_info(&self) -> EvalResult<ModelInfo> {
        Ok(ModelInfo::new(
            self.model_name.clone(),
            "1.0.0".to_string(),
            vec!["text-generation".to_string(), "chat".to_string()],
        ))
    }
}
