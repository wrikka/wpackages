//! types/llm.rs

use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Represents a single request to be sent to an LLM.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LlmRequest {
    #[serde(default = "Uuid::new_v4")]
    pub id: Uuid,
    pub model: String,
    pub prompt: String,
    // Add other parameters like temperature, max_tokens, etc. as needed.
}

/// Represents a response received from an LLM for a specific request.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LlmResponse {
    pub id: Uuid, // Corresponds to the LlmRequest ID.
    pub content: String,
    // Add other metadata like token usage, finish reason, etc.
}
