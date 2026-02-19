use serde::{Deserialize, Serialize};

/// Represents a fine-tuning job.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FineTuningJob {
    pub id: String,
    pub model: String,
    pub status: String,
    pub created_at: u64,
    pub finished_at: Option<u64>,
    pub fine_tuned_model: Option<String>,
}

/// Represents a request to create a fine-tuning job.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateFineTuningJobRequest {
    pub training_file: String,
    pub model: String,
    pub suffix: Option<String>,
}
