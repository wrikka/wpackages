//! Storage service types

/// Evaluation summary for listing
#[derive(Debug, Clone)]
pub struct EvalSummary {
    pub id: String,
    pub name: String,
    pub status: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub completed_at: Option<chrono::DateTime<chrono::Utc>>,
    pub total_samples: usize,
    pub pass_rate: f64,
}

impl EvalSummary {
    /// Create new evaluation summary
    pub fn new(
        id: String,
        name: String,
        status: String,
        created_at: chrono::DateTime<chrono::Utc>,
        completed_at: Option<chrono::DateTime<chrono::Utc>>,
        total_samples: usize,
        pass_rate: f64,
    ) -> Self {
        Self {
            id,
            name,
            status,
            created_at,
            completed_at,
            total_samples,
            pass_rate,
        }
    }
}
