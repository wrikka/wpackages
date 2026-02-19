use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamMessage<T> {
    pub id: String,
    pub data: T,
    pub timestamp: u64,
}

impl<T> StreamMessage<T> {
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
pub struct StreamStats {
    pub messages_produced: u64,
    pub messages_consumed: u64,
    pub buffer_size: usize,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum StreamStatus {
    Active,
    Paused,
    Closed,
}
