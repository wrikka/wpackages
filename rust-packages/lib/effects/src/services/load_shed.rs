use crate::error::EffectError;
use crate::types::effect::Effect;
use std::collections::VecDeque;
use std::sync::Arc;
use tokio::sync::Mutex;
use std::time::Duration;

/// Load shedding configuration
#[derive(Debug, Clone)]
pub struct LoadShedConfig {
    pub max_queue_size: usize,
    pub max_concurrent: usize,
    pub response_time_threshold: Duration,
}

impl Default for LoadShedConfig {
    fn default() -> Self {
        Self {
            max_queue_size: 1000,
            max_concurrent: 100,
            response_time_threshold: Duration::from_millis(500),
        }
    }
}

/// Circuit state for load shedding
#[derive(Debug, Clone)]
enum LoadShedState {
    Normal,
    Shedding,
    Recovery,
}

/// Load shedder
#[derive(Debug)]
pub struct LoadShedder {
    config: LoadShedConfig,
    state: Arc<Mutex<LoadShedState>>,
    queue_size: Arc<Mutex<usize>>,
    concurrent: Arc<Mutex<usize>>,
    response_times: Arc<Mutex<VecDeque<Duration>>>,
}

impl LoadShedder {
    pub fn new(config: LoadShedConfig) -> Self {
        Self {
            config,
            state: Arc::new(Mutex::new(LoadShedState::Normal)),
            queue_size: Arc::new(Mutex::new(0)),
            concurrent: Arc::new(Mutex::new(0)),
            response_times: Arc::new(Mutex::new(VecDeque::new())),
        }
    }

    pub async fn should_accept(&self) -> bool {
        let state = self.state.lock().await;
        matches!(*state, LoadShedState::Normal | LoadShedState::Recovery)
    }

    pub async fn record_response_time(&self, duration: Duration) {
        let mut times = self.response_times.lock().await;
        times.push_back(duration);
        if times.len() > 100 {
            times.pop_front();
        }

        // Update state based on metrics
        let avg_response = times.iter().sum::<Duration>() / times.len() as u32;
        let mut state = self.state.lock().await;

        if avg_response > self.config.response_time_threshold {
            *state = LoadShedState::Shedding;
        } else if matches!(*state, LoadShedState::Shedding) && avg_response < self.config.response_time_threshold / 2 {
            *state = LoadShedState::Recovery;
        }
    }
}

/// Load shedding extension
pub trait LoadShedExt<T, E, R> {
    /// Apply load shedding to effect
    fn with_load_shed(self, shedder: Arc<LoadShedder>) -> Effect<T, E, R>;
}

impl<T, E, R> LoadShedExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_load_shed(self, shedder: Arc<LoadShedder>) -> Effect<T, E, R> {
        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let shedder = shedder.clone();

            Box::pin(async move {
                if !shedder.should_accept().await {
                    return Err(EffectError::EffectFailed("Load shedding in effect - request dropped".to_string()).into());
                }

                let start = std::time::Instant::now();
                let result = effect.run(ctx).await;
                let elapsed = start.elapsed();

                shedder.record_response_time(elapsed).await;

                result
            })
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_load_shed_normal() {
        let shedder = Arc::new(LoadShedder::new(LoadShedConfig::default()));

        let effect = Effect::<i32, EffectError, ()>::success(42)
            .with_load_shed(shedder.clone());

        let result = effect.run(()).await;
        assert_eq!(result.unwrap(), 42);
    }
}
