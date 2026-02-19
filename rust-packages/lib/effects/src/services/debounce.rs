use crate::error::EffectError;
use crate::types::effect::Effect;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use std::time::{Duration, Instant};
use tokio::time::sleep;

/// Debounce configuration
#[derive(Debug, Clone)]
pub struct DebounceConfig {
    pub duration: Duration,
    pub leading: bool,  // Execute on leading edge
    pub trailing: bool, // Execute on trailing edge
}

impl Default for DebounceConfig {
    fn default() -> Self {
        Self {
            duration: Duration::from_millis(300),
            leading: false,
            trailing: true,
        }
    }
}

/// Debounce state
#[derive(Debug)]
struct DebounceState {
    last_call: Instant,
    pending: bool,
}

/// Debounce registry
#[derive(Debug, Default)]
pub struct DebounceRegistry {
    states: Arc<Mutex<HashMap<String, DebounceState>>>,
}

impl DebounceRegistry {
    pub fn new() -> Self {
        Self {
            states: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    async fn should_execute(&self, key: &str, config: &DebounceConfig) -> bool {
        let mut states = self.states.lock().await;
        let now = Instant::now();

        if let Some(state) = states.get(key) {
            let last_call = state.last_call;
            if now.duration_since(last_call) >= config.duration {
                states.insert(key.to_string(), DebounceState {
                    last_call: now,
                    pending: false,
                });
                true
            } else {
                states.insert(key.to_string(), DebounceState {
                    last_call,
                    pending: true,
                });
                false
            }
        } else {
            states.insert(key.to_string(), DebounceState {
                last_call: now,
                pending: false,
            });
            config.leading
        }
    }
}

/// Debounce extension trait
pub trait DebounceExt<T, E, R> {
    /// Debounce effect execution
    fn debounce(self, key: impl Into<String>, config: DebounceConfig) -> Effect<T, E, R>;

    /// Simple debounce with duration
    fn debounce_simple(self, key: impl Into<String>, duration: Duration) -> Effect<T, E, R>;

    /// Debounce latest (always execute latest call after delay)
    fn debounce_latest(self, key: impl Into<String>, duration: Duration) -> Effect<T, E, R>;
}

impl<T, E, R> DebounceExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn debounce(self, key: impl Into<String>, config: DebounceConfig) -> Effect<T, E, R> {
        let key = key.into();
        let registry = Arc::new(DebounceRegistry::new());

        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let key = key.clone();
            let config = config.clone();
            let registry = registry.clone();

            Box::pin(async move {
                if !registry.should_execute(&key, &config).await {
                    if config.trailing {
                        sleep(config.duration).await;
                    } else {
                        return Err(EffectError::EffectFailed("Debounced".to_string()).into());
                    }
                }

                effect.run(ctx).await
            })
        })
    }

    fn debounce_simple(self, key: impl Into<String>, duration: Duration) -> Effect<T, E, R> {
        let _key = key.into();
        self.debounce(duration)
    }

    fn debounce_latest(self, key: impl Into<String>, duration: Duration) -> Effect<T, E, R> {
        let _key = key.into();
        self.debounce(duration)
    }
}

/// Throttle configuration
#[derive(Debug, Clone)]
pub struct ThrottleConfig {
    pub duration: Duration,
    pub limit: u32, // Number of calls allowed per duration
}

impl Default for ThrottleConfig {
    fn default() -> Self {
        Self {
            duration: Duration::from_secs(1),
            limit: 1,
        }
    }
}

/// Throttle state
#[derive(Debug)]
struct ThrottleState {
    calls: Vec<Instant>,
}

/// Throttle registry
#[derive(Debug, Default)]
pub struct ThrottleRegistry {
    states: Arc<Mutex<HashMap<String, ThrottleState>>>,
}

impl ThrottleRegistry {
    pub fn new() -> Self {
        Self {
            states: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    async fn check_limit(&self, key: &str, config: &ThrottleConfig) -> bool {
        let mut states = self.states.lock().await;
        let now = Instant::now();

        let state = states.entry(key.to_string()).or_insert(ThrottleState {
            calls: Vec::new(),
        });

        // Remove old calls
        state.calls.retain(|&t| now.duration_since(t) < config.duration);

        if state.calls.len() < config.limit as usize {
            state.calls.push(now);
            true
        } else {
            false
        }
    }
}

/// Throttle extension trait
pub trait ThrottleExt<T, E, R> {
    /// Throttle effect execution
    fn throttle(self, key: impl Into<String>, config: ThrottleConfig) -> Effect<T, E, R>;
}

impl<T, E, R> ThrottleExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn throttle(self, key: impl Into<String>, config: ThrottleConfig) -> Effect<T, E, R> {
        let key = key.into();
        let registry = Arc::new(ThrottleRegistry::new());

        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let key = key.clone();
            let config = config.clone();
            let registry = registry.clone();

            Box::pin(async move {
                if !registry.check_limit(&key, &config).await {
                    return Err(EffectError::EffectFailed("Throttled".to_string()).into());
                }

                effect.run(ctx).await
            })
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_throttle() {
        let config = ThrottleConfig {
            duration: Duration::from_secs(1),
            limit: 2,
        };

        let effect = Effect::<i32, EffectError, ()>::success(42)
            .throttle("test", config);

        // First two calls should succeed
        let r1 = effect.clone().run(()).await;
        let r2 = effect.clone().run(()).await;
        assert!(r1.is_ok());
        assert!(r2.is_ok());

        // Third call should fail
        let r3 = effect.clone().run(()).await;
        assert!(r3.is_err());
    }
}
