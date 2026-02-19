//! Dead Letter Queue support (requires `distributed` feature)

use crate::error::EffectError;
use crate::types::effect::Effect;
use std::collections::VecDeque;
use std::sync::Arc;
use tokio::sync::Mutex;

/// Dead Letter Queue entry
#[derive(Debug, Clone)]
pub struct DlqEntry<T, E, R> {
    pub entry_id: String,
    pub effect: Effect<T, E, R>,
    pub context: R,
    pub error: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub retry_count: u32,
    pub max_retries: u32,
}

/// Dead Letter Queue store
#[derive(Debug)]
pub struct DeadLetterQueue<T, E, R> {
    entries: Arc<Mutex<VecDeque<DlqEntry<T, E, R>>>>,
    max_size: usize,
}

impl<T, E, R> DeadLetterQueue<T, E, R> {
    pub fn new(max_size: usize) -> Self {
        Self {
            entries: Arc::new(Mutex::new(VecDeque::new())),
            max_size,
        }
    }

    pub async fn push(&self, entry: DlqEntry<T, E, R>) {
        let mut entries = self.entries.lock().await;
        if entries.len() >= self.max_size {
            entries.pop_front(); // Remove oldest
        }
        entries.push_back(entry);
    }

    pub async fn pop(&self) -> Option<DlqEntry<T, E, R>> {
        let mut entries = self.entries.lock().await;
        entries.pop_front()
    }

    pub async fn len(&self) -> usize {
        let entries = self.entries.lock().await;
        entries.len()
    }

    pub async fn drain(&self) -> Vec<DlqEntry<T, E, R>> {
        let mut entries = self.entries.lock().await;
        entries.drain(..).collect()
    }
}

/// DLQ extension trait
pub trait DlqExt<T, E, R> {
    /// Send failed effects to DLQ
    fn with_dlq(self, dlq: Arc<DeadLetterQueue<T, E, R>>, max_retries: u32) -> Effect<T, E, R>;
}

impl<T, E, R> DlqExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Sync + Clone + 'static,
    E: Send + Sync + Clone + From<EffectError> + std::fmt::Display + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_dlq(self, dlq: Arc<DeadLetterQueue<T, E, R>>, max_retries: u32) -> Effect<T, E, R> {
        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let dlq = dlq.clone();

            Box::pin(async move {
                let result = effect.run(ctx.clone()).await;

                if let Err(ref e) = result {
                    #[cfg(feature = "distributed")]
                    let entry_id = uuid::Uuid::new_v4().to_string();
                    #[cfg(not(feature = "distributed"))]
                    let entry_id = format!("entry-{}", std::time::SystemTime::now().elapsed().unwrap().as_nanos());
                    let entry = DlqEntry {
                        entry_id,
                        effect: Effect::failure(e.clone()),
                        context: ctx,
                        error: e.to_string(),
                        timestamp: chrono::Utc::now(),
                        retry_count: 0,
                        max_retries,
                    };
                    dlq.push(entry).await;
                }

                result
            })
        })
    }
}

/// DLQ processor for retrying failed effects
pub struct DlqProcessor<T, E, R> {
    dlq: Arc<DeadLetterQueue<T, E, R>>,
}

impl<T, E, R> DlqProcessor<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    pub fn new(dlq: Arc<DeadLetterQueue<T, E, R>>) -> Self {
        Self { dlq }
    }

    pub async fn process_one(&self) -> Option<Result<T, E>> {
        if let Some(entry) = self.dlq.pop().await {
            if entry.retry_count < entry.max_retries {
                Some(entry.effect.run(entry.context).await)
            } else {
                None
            }
        } else {
            None
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_dlq() {
        let dlq = Arc::new(DeadLetterQueue::<i32, EffectError, ()>::new(100));

        let effect = Effect::<i32, EffectError, ()>::failure(EffectError::EffectFailed("error".to_string()))
            .with_dlq(dlq.clone(), 3);

        effect.run(()).await.unwrap_err();

        assert_eq!(dlq.len().await, 1);
    }
}
