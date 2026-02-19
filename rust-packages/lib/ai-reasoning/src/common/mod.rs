use serde::{Deserialize, Serialize};
use thiserror::Error;

/// Represents the input for the reasoning engine.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReasoningInput {
    pub query: String,
    // pub context: Option<serde_json::Value>, // Example: for additional context
}

/// Represents the output from the reasoning engine.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReasoningOutput {
    pub result: String,
    // pub metadata: Option<serde_json::Value>, // Example: for confidence scores, etc.
}

/// Defines the errors that can occur within the reasoning system.
#[derive(Error, Debug)]
pub enum Error {
    #[error("Failed to process reasoning request: {0}")]
    ProcessingError(String),
    #[error("Invalid input: {0}")]
    InvalidInput(String),
    #[error(transparent)]
    Io(#[from] std::io::Error),
}
