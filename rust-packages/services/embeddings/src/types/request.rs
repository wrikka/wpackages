use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmbeddingRequest {
    pub texts: Vec<String>,
    pub options: EmbeddingOptions,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmbeddingOptions {
    pub normalize: bool,
    pub max_length: Option<usize>,
}

impl Default for EmbeddingOptions {
    fn default() -> Self {
        Self {
            normalize: true,
            max_length: None,
        }
    }
}
