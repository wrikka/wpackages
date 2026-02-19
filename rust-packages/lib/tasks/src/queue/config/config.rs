use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueueConfig {
    pub max_size: usize,
    pub ttl: Option<u64>,
}

impl Default for QueueConfig {
    fn default() -> Self {
        Self {
            max_size: 1000,
            ttl: None,
        }
    }
}
