use serde::{Deserialize, Serialize};

/// Represents a single training example for fine-tuning.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FinetuneExample {
    pub anchor: String,
    pub positive: String,
    pub negative: String,
}

/// Configuration for a fine-tuning job.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FinetuneConfig {
    pub model_id: String,
    pub dataset: Vec<FinetuneExample>,
    pub epochs: usize,
    pub learning_rate: f64,
    pub batch_size: usize,
}
