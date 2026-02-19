use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchItem<T> {
    pub id: String,
    pub data: T,
    pub timestamp: u64,
}

impl<T> BatchItem<T> {
    pub fn new(id: impl Into<String>, data: T) -> Self {
        Self {
            id: id.into(),
            data,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchResult<T> {
    pub items: Vec<T>,
    pub processed_count: usize,
    pub failed_count: usize,
    pub duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchStats {
    pub total_batches: usize,
    pub total_items: usize,
    pub average_batch_size: f64,
}
