use crate::resilience::components::rate::token_bucket_logic::TokenBucketState;
use crate::resilience::error::Result;
use crate::resilience::services::rate::TokenBucketStorage;
use async_trait::async_trait;

pub struct InMemoryStorage {
    states: std::sync::Arc<
        tokio::sync::Mutex<
            std::collections::HashMap<
                String,
                super::token_bucket_storage::TokenBucketStateData,
            >,
        >,
    >,
}

impl InMemoryStorage {
    pub fn new() -> Self {
        Self {
            states: std::sync::Arc::new(tokio::sync::Mutex::new(std::collections::HashMap::new())),
        }
    }
}

#[async_trait]
impl TokenBucketStorage for InMemoryStorage {
    async fn get_state(
        &self,
        key: &str,
    ) -> Result<Option<super::token_bucket_storage::TokenBucketStateData>> {
        let states = self.states.lock().await;
        Ok(states.get(key).cloned())
    }

    async fn set_state(
        &self,
        key: &str,
        state: &super::token_bucket_storage::TokenBucketStateData,
    ) -> Result<()> {
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
