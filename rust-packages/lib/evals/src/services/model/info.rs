//! Model information types

/// Model information
#[derive(Debug, Clone)]
pub struct ModelInfo {
    pub name: String,
    pub version: String,
    pub capabilities: Vec<String>,
    pub max_tokens: Option<usize>,
    pub temperature: Option<f32>,
}

impl ModelInfo {
    /// Create new model info
    pub fn new(
        name: String,
        version: String,
        capabilities: Vec<String>,
    ) -> Self {
        Self {
            name,
            version,
            capabilities,
            max_tokens: None,
            temperature: None,
        }
    }

    /// Set max tokens
    pub fn with_max_tokens(mut self, max_tokens: usize) -> Self {
        self.max_tokens = Some(max_tokens);
        self
    }

    /// Set temperature
    pub fn with_temperature(mut self, temperature: f32) -> Self {
        self.temperature = Some(temperature);
        self
    }
}
