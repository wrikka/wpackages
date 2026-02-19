use crate::resilience::components::rate::token_bucket_logic::TokenBucketState;
use crate::resilience::error::Result;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

/// Storage trait for token bucket state
#[async_trait]
pub trait TokenBucketStorage: Send + Sync {
    async fn get_state(&self, key: &str) -> Result<Option<TokenBucketStateData>>;
    async fn set_state(&self, key: &str, state: &TokenBucketStateData) -> Result<()>;
    async fn delete(&self, key: &str) -> Result<()>;
}

/// Serialized token bucket state for storage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenBucketStateData {
    pub tokens: f64,
    pub last_refill: u64,
    pub capacity: f64,
    pub refill_rate: f64,
}

impl From<TokenBucketState> for TokenBucketStateData {
    fn from(state: TokenBucketState) -> Self {
        Self {
            tokens: state.tokens,
            last_refill: state.last_refill,
            capacity: state.capacity,
            refill_rate: state.refill_rate,
        }
    }
}

impl Into<TokenBucketState> for TokenBucketStateData {
    fn into(self) -> TokenBucketState {
        TokenBucketState {
            tokens: self.tokens,
            last_refill: self.last_refill,
            capacity: self.capacity,
            refill_rate: self.refill_rate,
        }
    }
}

/// In-memory implementation of token bucket storage
pub struct InMemoryTokenBucketStorage {
    states:
        std::sync::Arc<tokio::sync::Mutex<std::collections::HashMap<String, TokenBucketStateData>>>,
}

impl InMemoryTokenBucketStorage {
    pub fn new() -> Self {
        Self {
            states: std::sync::Arc::new(tokio::sync::Mutex::new(std::collections::HashMap::new())),
        }
    }
}

impl Default for InMemoryTokenBucketStorage {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl TokenBucketStorage for InMemoryTokenBucketStorage {
    async fn get_state(&self, key: &str) -> Result<Option<TokenBucketStateData>> {
        let states = self.states.lock().await;
        Ok(states.get(key).cloned())
    }

    async fn set_state(&self, key: &str, state: &TokenBucketStateData) -> Result<()> {
        let mut states = self.states.lock().await;
        states.insert(key.to_string(), state.clone());
        Ok(())
    }

    async fn delete(&self, key: &str) -> Result<()> {
        let mut states = self.states.lock().await;
        states.remove(key);
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_in_memory_storage() {
        let storage = InMemoryTokenBucketStorage::new();
        let state_data = TokenBucketStateData {
            tokens: 10.0,
            last_refill: 0,
            capacity: 10.0,
            refill_rate: 1.0,
        };

        storage.set_state("test", &state_data).await.unwrap();
        let retrieved = storage.get_state("test").await.unwrap();
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().tokens, 10.0);

        storage.delete("test").await.unwrap();
        let retrieved = storage.get_state("test").await.unwrap();
        assert!(retrieved.is_none());
    }
}
