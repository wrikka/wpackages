//! Shadow traffic support (requires `shadow-traffic` feature)

use crate::error::EffectError;
use crate::types::effect::Effect;
use std::sync::Arc;
use tokio::sync::Mutex;

/// Shadow traffic configuration
#[derive(Debug, Clone)]
pub struct ShadowConfig {
    pub enable_shadow: bool,
    pub sample_rate: f64, // 0.0 to 1.0
    pub async_shadow: bool,
}

impl Default for ShadowConfig {
    fn default() -> Self {
        Self {
            enable_shadow: true,
            sample_rate: 0.1,
            async_shadow: true,
        }
    }
}

/// Mirror/metrics collector for shadow traffic
#[derive(Debug, Clone)]
pub struct ShadowMetrics {
    pub primary_latency_ms: u64,
    pub shadow_latency_ms: u64,
    pub primary_success: bool,
    pub shadow_success: bool,
}

/// Shadow traffic extension
pub trait ShadowExt<T, E, R> {
    /// Mirror traffic to shadow effect without affecting primary result
    fn with_shadow(self, shadow_effect: Effect<T, E, R>, config: ShadowConfig) -> Effect<T, E, R>;

    /// Compare results between primary and shadow
    fn with_mirror(self, shadow_effect: Effect<T, E, R>, config: ShadowConfig) -> Effect<(T, Option<ShadowMetrics>), E, R>
    where
        T: PartialEq;
}

#[cfg(feature = "shadow-traffic")]
impl<T, E, R> ShadowExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_shadow(self, shadow_effect: Effect<T, E, R>, config: ShadowConfig) -> Effect<T, E, R> {
        Effect::new(move |ctx: R| {
            let primary = self.clone();
            let shadow = shadow_effect.clone();
            let ctx = ctx.clone();
            let config = config.clone();

            Box::pin(async move {
                // Execute primary
                let primary_result = primary.run(ctx.clone()).await;

                // Execute shadow if enabled and sample rate matches
                if config.enable_shadow && rand::random::<f64>() < config.sample_rate {
                    if config.async_shadow {
                        // Spawn shadow execution asynchronously
                        tokio::spawn(async move {
                            let _ = shadow.run(ctx).await;
                        });
                    } else {
                        // Synchronous shadow execution
                        let _ = shadow.run(ctx).await;
                    }
                }

                primary_result
            })
        })
    }

    fn with_mirror(self, shadow_effect: Effect<T, E, R>, config: ShadowConfig) -> Effect<(T, Option<ShadowMetrics>), E, R>
    where
        T: PartialEq,
    {
        Effect::new(move |ctx: R| {
            let primary = self.clone();
            let shadow = shadow_effect.clone();
            let ctx = ctx.clone();
            let config = config.clone();

            Box::pin(async move {
                let primary_start = std::time::Instant::now();
                let primary_result = primary.run(ctx.clone()).await;
                let primary_latency = primary_start.elapsed().as_millis() as u64;

                let (primary_value, shadow_metrics) = match primary_result {
                    Ok(value) => {
                        if config.enable_shadow && rand::random::<f64>() < config.sample_rate {
                            let shadow_start = std::time::Instant::now();
                            let shadow_result = shadow.run(ctx).await;
                            let shadow_latency = shadow_start.elapsed().as_millis() as u64;

                            let metrics = ShadowMetrics {
                                primary_latency_ms: primary_latency,
                                shadow_latency_ms: shadow_latency,
                                primary_success: true,
                                shadow_success: shadow_result.is_ok(),
                            };

                            (value, Some(metrics))
                        } else {
                            (value, None)
                        }
                    }
                    Err(e) => return Err(e),
                };

                Ok((primary_value, shadow_metrics))
            })
        })
    }
}

#[cfg(all(test, feature = "shadow-traffic"))]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_shadow_traffic() {
        let shadow_counter = Arc::new(Mutex::new(0));
        let shadow_counter_clone = shadow_counter.clone();

        let shadow_effect = Effect::<i32, EffectError, ()>::new(move |_| {
            let counter = shadow_counter_clone.clone();
            Box::pin(async move {
                let mut guard = counter.lock().await;
                *guard += 1;
                Ok(100)
            })
        });

        let config = ShadowConfig {
            enable_shadow: true,
            sample_rate: 1.0, // Always run shadow
            async_shadow: false,
        };

        let effect = Effect::<i32, EffectError, ()>::success(42)
            .with_shadow(shadow_effect, config);

        let result = effect.run(()).await;
        assert_eq!(result.unwrap(), 42);

        // Shadow should have executed
        let guard = shadow_counter.lock().await;
        assert_eq!(*guard, 1);
    }
}
