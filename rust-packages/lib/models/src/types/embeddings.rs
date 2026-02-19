//! Embeddings types
//!
//! This module defines types for embeddings.

use serde::{Deserialize, Serialize};

/// Embeddings request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmbeddingsRequest {
    pub model: String,
    pub input: EmbeddingsInput,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub encoding_format: Option<String>,
}

impl EmbeddingsRequest {
    pub fn new(model: impl Into<String>, input: EmbeddingsInput) -> Self {
        Self {
            model: model.into(),
            input,
            encoding_format: None,
        }
    }
}

/// Input for embeddings (can be single string or array)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum EmbeddingsInput {
    Single(String),
    Multiple(Vec<String>),
}

/// Embeddings response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmbeddingsResponse {
    pub object: String,
    pub data: Vec<EmbeddingData>,
    pub model: String,
    pub usage: super::usage::Usage,
}

/// A single embedding
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmbeddingData {
    pub object: String,
    pub embedding: Vec<f32>,
    pub index: u32,
}
