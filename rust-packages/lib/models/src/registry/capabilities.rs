use serde::{Deserialize, Serialize};

/// Represents the different modalities a model can support.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Modality {
    Text,
    Vision,
    Audio,
}

/// Defines the capabilities of a specific AI model.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelCapability {
    /// The unique identifier for the model (e.g., "gpt-4o").
    pub model_name: String,

    /// The size of the model's context window in tokens.
    pub context_window: u32,

    /// The modalities supported by the model.
    pub modalities: Vec<Modality>,

    /// The cost per million input tokens in USD cents.
    pub cost_per_million_input_tokens: u32,

    /// The cost per million output tokens in USD cents.
    pub cost_per_million_output_tokens: u32,

    /// The provider of the model (e.g., "OpenAI", "Anthropic").
    pub provider: String,
}
