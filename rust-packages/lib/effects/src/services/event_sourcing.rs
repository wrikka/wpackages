//! Event sourcing support (requires `distributed` feature)

use crate::error::EffectError;
use crate::types::effect::Effect;
use std::collections::HashMap;
use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::Mutex;
use serde::{Deserialize, Serialize};

/// Event store for persisting effect events
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EffectEvent {
    pub event_id: String,
    pub effect_id: String,
    pub event_type: EventType,
    pub payload: serde_json::Value,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub sequence: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EventType {
    EffectStarted,
    EffectCompleted,
    EffectFailed,
    EffectRetried,
    EffectCancelled,
    EffectCompensated,
    Custom(String),
}

/// Event sourcing configuration
#[derive(Debug, Clone)]
pub struct EventSourcingConfig {
    pub snapshot_interval: usize,
    pub retention_days: u32,
}

impl Default for EventSourcingConfig {
    fn default() -> Self {
        Self {
            snapshot_interval: 100,
            retention_days: 30,
        }
    }
}

/// Event store trait
#[async_trait::async_trait]
pub trait EventStore: Send + Sync {
    async fn append(&self, event: EffectEvent) -> Result<(), EffectError>;
    async fn read(&self, effect_id: &str) -> Result<Vec<EffectEvent>, EffectError>;
    async fn read_since(&self, effect_id: &str, sequence: u64) -> Result<Vec<EffectEvent>, EffectError>;
}

/// In-memory event store implementation
#[derive(Debug, Default)]
pub struct InMemoryEventStore {
    events: Arc<Mutex<HashMap<String, Vec<EffectEvent>>>>,
}

impl InMemoryEventStore {
    pub fn new() -> Self {
        Self {
            events: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

#[async_trait::async_trait]
impl EventStore for InMemoryEventStore {
    async fn append(&self, event: EffectEvent) -> Result<(), EffectError> {
        let mut events = self.events.lock().await;
        events
            .entry(event.effect_id.clone())
            .or_insert_with(Vec::new)
            .push(event);
        Ok(())
    }

    async fn read(&self, effect_id: &str) -> Result<Vec<EffectEvent>, EffectError> {
        let events = self.events.lock().await;
        Ok(events.get(effect_id).cloned().unwrap_or_default())
    }

    async fn read_since(&self, effect_id: &str, sequence: u64) -> Result<Vec<EffectEvent>, EffectError> {
        let events = self.events.lock().await;
        let all = events.get(effect_id).cloned().unwrap_or_default();
        Ok(all.into_iter().filter(|e| e.sequence >= sequence).collect())
    }
}

/// Event sourcing extension for effects
pub trait EventSourcingExt<T, E, R> {
    /// Enable event sourcing for this effect
    fn with_event_sourcing(self, effect_id: impl Into<String>, store: Arc<dyn EventStore>) -> Effect<T, E, R>;
}

impl<T, E, R> EventSourcingExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + serde::Serialize + 'static,
    E: Send + Clone + From<EffectError> + serde::Serialize + std::fmt::Display + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_event_sourcing(self, effect_id: impl Into<String>, store: Arc<dyn EventStore>) -> Effect<T, E, R> {
        let effect_id = effect_id.into();
        let sequence = Arc::new(Mutex::new(0u64));

        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let effect_id = effect_id.clone();
            let store = store.clone();
            let sequence = sequence.clone();

            Box::pin(async move {
                // Emit started event
                let seq = {
                    let mut guard = sequence.lock().await;
                    *guard += 1;
                    *guard
                };

                #[cfg(feature = "distributed")]
                let started_event = EffectEvent {
                    event_id: uuid::Uuid::new_v4().to_string(),
                    effect_id: effect_id.clone(),
                    event_type: EventType::EffectStarted,
                    payload: serde_json::json!({ "timestamp": chrono::Utc::now() }),
                    timestamp: chrono::Utc::now(),
                    sequence: seq,
                };
                #[cfg(not(feature = "distributed"))]
                let started_event = EffectEvent {
                    event_id: format!("evt-{}", std::time::SystemTime::now().elapsed().unwrap().as_nanos()),
                    effect_id: effect_id.clone(),
                    event_type: EventType::EffectStarted,
                    payload: serde_json::json!({ "timestamp": chrono::Utc::now() }),
                    timestamp: chrono::Utc::now(),
                    sequence: seq,
                };
                let _ = store.append(started_event).await;

                // Execute effect
                let result = effect.run(ctx).await;

                // Emit completion/failure event
                let seq = {
                    let mut guard = sequence.lock().await;
                    *guard += 1;
                    *guard
                };

                let event = match &result {
                    Ok(value) => {
                        #[cfg(feature = "distributed")]
                        let event_id = uuid::Uuid::new_v4().to_string();
                        #[cfg(not(feature = "distributed"))]
                        let event_id = format!("evt-{}", std::time::SystemTime::now().elapsed().unwrap().as_nanos());
                        EffectEvent {
                            event_id,
                            effect_id: effect_id.clone(),
                            event_type: EventType::EffectCompleted,
                            payload: serde_json::json!({ "result": value }),
                            timestamp: chrono::Utc::now(),
                            sequence: seq,
                        }
                    },
                    Err(err) => {
                        #[cfg(feature = "distributed")]
                        let event_id = uuid::Uuid::new_v4().to_string();
                        #[cfg(not(feature = "distributed"))]
                        let event_id = format!("evt-{}", std::time::SystemTime::now().elapsed().unwrap().as_nanos());
                        EffectEvent {
                            event_id,
                            effect_id: effect_id.clone(),
                            event_type: EventType::EffectFailed,
                            payload: serde_json::json!({ "error": err.to_string() }),
                            timestamp: chrono::Utc::now(),
                            sequence: seq,
                        }
                    },
                };
                let _ = store.append(event).await;

                result
            })
        })
    }
}

/// Snapshot for efficient replay
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EffectSnapshot {
    pub effect_id: String,
    pub sequence: u64,
    pub state: serde_json::Value,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

/// Snapshot store trait
#[async_trait::async_trait]
pub trait SnapshotStore: Send + Sync {
    async fn save(&self, snapshot: EffectSnapshot) -> Result<(), EffectError>;
    async fn load(&self, effect_id: &str) -> Result<Option<EffectSnapshot>, EffectError>;
}

/// Replayable effect trait
#[async_trait::async_trait]
pub trait ReplayableEffect {
    type State: Send + Clone + Serialize + for<'de> Deserialize<'de>;

    async fn apply_event(&mut self, event: &EffectEvent) -> Result<(), EffectError>;
    fn snapshot(&self) -> Self::State;
    fn restore(&mut self, state: Self::State);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_event_sourcing() {
        let store = Arc::new(InMemoryEventStore::new());
        let store_clone = store.clone();

        let effect = Effect::<i32, EffectError, ()>::success(42)
            .with_event_sourcing("test-effect", store_clone);

        let result = effect.run(()).await;
        assert_eq!(result.unwrap(), 42);

        // Check events were stored
        let events = store.read("test-effect").await.unwrap();
        assert_eq!(events.len(), 2);
        assert!(matches!(events[0].event_type, EventType::EffectStarted));
        assert!(matches!(events[1].event_type, EventType::EffectCompleted));
    }

    #[tokio::test]
    async fn test_event_sourcing_failure() {
        let store = Arc::new(InMemoryEventStore::new());
        let store_clone = store.clone();

        let effect = Effect::<i32, EffectError, ()>::failure(EffectError::EffectFailed("error".to_string()))
            .with_event_sourcing("test-effect-fail", store_clone);

        let result = effect.run(()).await;
        assert!(result.is_err());

        // Check events were stored
        let events = store.read("test-effect-fail").await.unwrap();
        assert_eq!(events.len(), 2);
        assert!(matches!(events[0].event_type, EventType::EffectStarted));
        assert!(matches!(events[1].event_type, EventType::EffectFailed));
    }
}
