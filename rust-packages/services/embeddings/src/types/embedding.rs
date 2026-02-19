use serde::{Deserialize, Serialize};

pub type Embedding = Vec<f32>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmbeddingConfig {
    pub model_path: String,
    pub tokenizer_path: String,
    pub max_length: Option<usize>,
    pub normalize: Option<bool>,
}
