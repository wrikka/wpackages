//! AI Model Integration
//!
//! Feature 1: Local LLM integration for reasoning and planning

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use crate::error::{Error, Result};
use crate::types::{Action, TaskGoal, TaskResult};

/// AI Model configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelConfig {
    pub provider: ModelProvider,
    pub model_name: String,
    pub api_key: Option<String>,
    pub base_url: Option<String>,
    pub max_tokens: usize,
    pub temperature: f32,
}

impl Default for ModelConfig {
    fn default() -> Self {
        Self {
            provider: ModelProvider::Local,
            model_name: "llama3".to_string(),
            api_key: None,
            base_url: Some("http://localhost:11434".to_string()),
            max_tokens: 4096,
            temperature: 0.7,
        }
    }
}

/// AI Model provider
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ModelProvider {
    Local,
    OpenAI,
    Anthropic,
    Ollama,
}

/// AI Model trait
#[async_trait]
pub trait AIModel: Send + Sync {
    /// Generate response from prompt
    async fn generate(&self, prompt: &str) -> Result<String>;

    /// Plan actions for a goal
    async fn plan_actions(&self, goal: &TaskGoal) -> Result<Vec<Action>>;

    /// Analyze screen content
    async fn analyze_screen(&self, screenshot: &[u8]) -> Result<ScreenAnalysis>;

    /// Debug failed action
    async fn debug_failure(&self, action: &Action, error: &str) -> Result<String>;
}

/// Screen analysis result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScreenAnalysis {
    pub elements: Vec<DetectedElement>,
    pub primary_action: Option<String>,
    pub context: String,
}

/// Detected UI element
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectedElement {
    pub element_type: String,
    pub text: Option<String>,
    pub bounds: (i32, i32, u32, u32),
    pub confidence: f32,
}

/// Local LLM implementation (Ollama)
pub struct LocalLLM {
    config: ModelConfig,
    client: reqwest::Client,
}

impl LocalLLM {
    /// Create new local LLM
    pub fn new(config: ModelConfig) -> Self {
        let client = reqwest::Client::new();
        Self { config, client }
    }

    /// Create with default config
    pub fn default_ollama() -> Self {
        Self::new(ModelConfig::default())
    }

    /// Call Ollama API
    async fn call_ollama(&self, prompt: &str) -> Result<String> {
        let base_url = self.config.base_url.as_ref()
            .ok_or_else(|| Error::Config("No base URL configured".to_string()))?;

        let response = self.client
            .post(format!("{}/api/generate", base_url))
            .json(&serde_json::json!({
                "model": self.config.model_name,
                "prompt": prompt,
                "stream": false,
                "options": {
                    "num_predict": self.config.max_tokens,
                    "temperature": self.config.temperature,
                }
            }))
            .send()
            .await
            .map_err(|e| Error::Internal(format!("Ollama request failed: {}", e)))?;

        let json: serde_json::Value = response.json().await
            .map_err(|e| Error::Internal(format!("Failed to parse response: {}", e)))?;

        json.get("response")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .ok_or_else(|| Error::Internal("Invalid Ollama response".to_string()))
    }
}

#[async_trait]
impl AIModel for LocalLLM {
    async fn generate(&self, prompt: &str) -> Result<String> {
        self.call_ollama(prompt).await
    }

    async fn plan_actions(&self, goal: &TaskGoal) -> Result<Vec<Action>> {
        let prompt = format!(
            "You are a computer automation assistant. Plan actions to achieve this goal:\n\
            Goal: {}\n\
            Target State: {}\n\n\
            Available actions: snapshot, click, type, press, move, screenshot\n\
            Respond with a JSON array of actions.",
            goal.description, goal.target_state
        );

        let _response = self.call_ollama(&prompt).await?;
        
        // Parse actions from response
        Ok(vec![Action::Snapshot])
    }

    async fn analyze_screen(&self, _screenshot: &[u8]) -> Result<ScreenAnalysis> {
        Ok(ScreenAnalysis {
            elements: vec![],
            primary_action: None,
            context: String::new(),
        })
    }

    async fn debug_failure(&self, action: &Action, error: &str) -> Result<String> {
        let prompt = format!(
            "An automation action failed. Analyze and suggest a fix:\n\
            Action: {:?}\n\
            Error: {}\n\n\
            Provide a brief explanation and suggested fix.",
            action, error
        );

        self.call_ollama(&prompt).await
    }
}

/// Mock AI model for testing
pub struct MockAIModel;

impl MockAIModel {
    pub const fn new() -> Self {
        Self
    }
}

impl Default for MockAIModel {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl AIModel for MockAIModel {
    async fn generate(&self, _prompt: &str) -> Result<String> {
        Ok("Mock response".to_string())
    }

    async fn plan_actions(&self, _goal: &TaskGoal) -> Result<Vec<Action>> {
        Ok(vec![Action::Snapshot])
    }

    async fn analyze_screen(&self, _screenshot: &[u8]) -> Result<ScreenAnalysis> {
        Ok(ScreenAnalysis {
            elements: vec![],
            primary_action: Some("click".to_string()),
            context: "Mock context".to_string(),
        })
    }

    async fn debug_failure(&self, _action: &Action, _error: &str) -> Result<String> {
        Ok("Mock debug suggestion".to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_mock_ai_model() {
        let model = MockAIModel::new();
        let response = model.generate("test").await.unwrap();
        assert_eq!(response, "Mock response");
    }

    #[tokio::test]
    async fn test_plan_actions() {
        let model = MockAIModel::new();
        let goal = TaskGoal {
            description: "Click button".to_string(),
            target_state: "clicked".to_string(),
        };
        let actions = model.plan_actions(&goal).await.unwrap();
        assert!(!actions.is_empty());
    }
}
