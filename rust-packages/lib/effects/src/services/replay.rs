use crate::error::EffectError;
use crate::types::effect::Effect;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use std::time::{Duration, Instant};

/// Replay configuration
#[derive(Debug, Clone)]
pub struct ReplayConfig {
    pub max_replays: usize,
    pub delay_between_replays: Duration,
    pub stop_on_success: bool,
}

impl Default for ReplayConfig {
    fn default() -> Self {
        Self {
            max_replays: 10,
            delay_between_replays: Duration::from_millis(100),
            stop_on_success: true,
        }
    }
}

/// Effect recording for replay
#[derive(Debug, Clone)]
pub struct EffectRecording {
    pub effect_id: String,
    pub inputs: Vec<serde_json::Value>,
    pub outputs: Vec<Result<serde_json::Value, String>>,
    pub execution_times: Vec<Duration>,
    pub timestamp: Instant,
}

/// Recording store
#[derive(Debug, Default)]
pub struct RecordingStore {
    recordings: Arc<Mutex<HashMap<String, EffectRecording>>>,
}

impl RecordingStore {
    pub fn new() -> Self {
        Self {
            recordings: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn save(&self, recording: EffectRecording) {
        let mut recordings = self.recordings.lock().await;
        recordings.insert(recording.effect_id.clone(), recording);
    }

    pub async fn load(&self, effect_id: &str) -> Option<EffectRecording> {
        let recordings = self.recordings.lock().await;
        recordings.get(effect_id).cloned()
    }
}

/// Replayable effect extension
pub trait ReplayableExt<T, E, R> {
    /// Make effect recordable for later replay
    fn recordable(self, effect_id: impl Into<String>, store: Arc<RecordingStore>) -> Effect<T, E, R>;
}

impl<T, E, R> ReplayableExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + serde::Serialize + 'static,
    E: Send + Clone + From<EffectError> + std::fmt::Display + 'static,
    R: Send + Sync + Clone + serde::Serialize + 'static,
{
    fn recordable(self, effect_id: impl Into<String>, store: Arc<RecordingStore>) -> Effect<T, E, R> {
        let effect_id = effect_id.into();

        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let effect_id = effect_id.clone();
            let store = store.clone();

            Box::pin(async move {
                let start = Instant::now();
                let result = effect.run(ctx.clone()).await;
                let execution_time = start.elapsed();

                // Serialize input
                let input = serde_json::to_value(&ctx).ok();

                // Serialize output
                let output = match &result {
                    Ok(val) => Ok(serde_json::to_value(val).unwrap_or_default()),
                    Err(e) => Err(e.to_string()),
                };

                // Create or update recording
                let mut recording = store.load(&effect_id).await.unwrap_or_else(|| EffectRecording {
                    effect_id: effect_id.clone(),
                    inputs: Vec::new(),
                    outputs: Vec::new(),
                    execution_times: Vec::new(),
                    timestamp: Instant::now(),
                });

                if let Some(inp) = input {
                    recording.inputs.push(inp);
                }
                recording.outputs.push(output);
                recording.execution_times.push(execution_time);

                store.save(recording).await;

                result
            })
        })
    }
}

/// Replay effect from recording
pub fn replay_effect<T, E, R>(
    effect_id: impl Into<String>,
    store: Arc<RecordingStore>,
    config: ReplayConfig,
) -> Effect<T, E, R>
where
    T: Send + Clone + for<'de> serde::Deserialize<'de> + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    let effect_id = effect_id.into();

    Effect::new(move |_ctx: R| {
        let effect_id = effect_id.clone();
        let store = store.clone();
        let config = config.clone();

        Box::pin(async move {
            let recording = match store.load(&effect_id).await {
                Some(r) => r,
                None => {
                    return Err(EffectError::EffectFailed(format!(
                        "No recording found for effect '{}'",
                        effect_id
                    ))
                    .into())
                }
            };

            // Try to replay from recorded outputs
            for (i, output) in recording.outputs.iter().enumerate() {
                if i >= config.max_replays {
                    break;
                }

                match output {
                    Ok(val) => {
                        if let Ok(result) = serde_json::from_value::<T>(val.clone()) {
                            if config.stop_on_success {
                                return Ok(result);
                            }
                        }
                    }
                    Err(_) => {
                        tokio::time::sleep(config.delay_between_replays).await;
                    }
                }
            }

            Err(EffectError::EffectFailed("Replay failed".to_string()).into())
        })
    })
}

/// Debug configuration
pub struct DebugConfig {
    pub trace: bool,
    pub log_inputs: bool,
    pub log_outputs: bool,
    pub breakpoint: Option<Box<dyn Fn(&str) -> bool + Send + Sync>>,
}

impl std::fmt::Debug for DebugConfig {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("DebugConfig")
            .field("trace", &self.trace)
            .field("log_inputs", &self.log_inputs)
            .field("log_outputs", &self.log_outputs)
            .field("breakpoint", &self.breakpoint.is_some())
            .finish()
    }
}

impl Clone for DebugConfig {
    fn clone(&self) -> Self {
        Self {
            trace: self.trace,
            log_inputs: self.log_inputs,
            log_outputs: self.log_outputs,
            breakpoint: None, // Can't clone the breakpoint
        }
    }
}

/// Debug extension trait
pub trait DebugExt<T, E, R> {
    /// Add debugging to effect
    fn debug(self, name: impl Into<String>, config: DebugConfig) -> Effect<T, E, R>;
}

impl<T, E, R> DebugExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + std::fmt::Debug + 'static,
    E: Send + Clone + From<EffectError> + std::fmt::Debug + 'static,
    R: Send + Sync + Clone + std::fmt::Debug + 'static,
{
    fn debug(self, name: impl Into<String>, config: DebugConfig) -> Effect<T, E, R> {
        let name = name.into();

        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let name = name.clone();
            let config = config.clone();

            Box::pin(async move {
                if config.trace {
                    tracing::info!("[{}] Starting effect execution", name);
                }
                if config.log_inputs {
                    tracing::info!("[{}] Input: {:?}", name, ctx);
                }

                // Check breakpoint
                if let Some(ref bp) = config.breakpoint {
                    if bp(&name) {
                        tracing::info!("[{}] BREAKPOINT HIT", name);
                    }
                }

                let start = Instant::now();
                let result = effect.run(ctx).await;
                let elapsed = start.elapsed();

                if config.trace {
                    tracing::info!("[{}] Effect completed in {:?}", name, elapsed);
                }
                if config.log_outputs {
                    tracing::info!("[{}] Output: {:?}", name, result);
                }

                result
            })
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_recording() {
        let store = Arc::new(RecordingStore::new());
        let store_clone = store.clone();

        let effect = Effect::<i32, EffectError, ()>::success(42)
            .recordable("test-effect", store_clone);

        let result = effect.run(()).await;
        assert_eq!(result.unwrap(), 42);

        // Check recording
        let recording = store.load("test-effect").await.unwrap();
        assert_eq!(recording.effect_id, "test-effect");
        assert_eq!(recording.outputs.len(), 1);
    }

    #[tokio::test]
    async fn test_replay() {
        let store = Arc::new(RecordingStore::new());

        // First, record an effect
        let effect = Effect::<i32, EffectError, ()>::success(42)
            .recordable("replay-test", store.clone());
        effect.run(()).await.unwrap();

        // Then replay it
        let replay = replay_effect::<i32, EffectError, ()>("replay-test", store.clone(), Default::default());
        let result = replay.run(()).await;
        assert_eq!(result.unwrap(), 42);
    }
}
