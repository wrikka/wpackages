use crate::types::ai_completion::{AiCompletionClient, CompletionRequest, CompletionContext, CompletionOptions, ModelConfig};

#[derive(Debug, Clone, Default)]
pub struct AiCompletionState {
    pub client: AiCompletionClient,
    pub config: ModelConfig,
    pub enabled: bool,
    pub suggestions_history: Vec<String>,
}

impl AiCompletionState {
    pub fn new() -> Self {
        Self {
            client: AiCompletionClient::new(ModelConfig::new("", "gpt-4")),
            config: ModelConfig::new("", "gpt-4"),
            enabled: false,
            suggestions_history: Vec::new(),
        }
    }

    pub fn with_client(mut self, client: AiCompletionClient) -> Self {
        self.client = client;
        self
    }

    pub fn with_config(mut self, config: ModelConfig) -> Self {
        self.config = config;
        self
    }

    pub fn with_enabled(mut self, enabled: bool) -> Self {
        self.enabled = enabled;
        self
    }

    pub fn set_config(&mut self, config: ModelConfig) {
        self.config = config;
    }

    pub fn set_enabled(&mut self, enabled: bool) {
        self.enabled = enabled;
    }

    pub fn add_suggestion(&mut self, suggestion: String) {
        self.suggestions_history.push(suggestion);
    }

    pub fn is_enabled(&self) -> bool {
        self.enabled
    }

    pub fn is_ready(&self) -> bool {
        !self.config.api_key.is_empty()
    }

    pub fn suggestion_count(&self) -> usize {
        self.suggestions_history.len()
    }
}
