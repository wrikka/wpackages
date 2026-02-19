//! Conditional execution support

use crate::error::EffectError;
use crate::types::effect::Effect;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{Mutex, RwLock};
use std::time::{Duration, Instant};

/// Feature flag store
#[derive(Debug, Default)]
pub struct FeatureFlagStore {
    flags: Arc<RwLock<HashMap<String, bool>>>,
}

impl FeatureFlagStore {
    pub fn new() -> Self {
        Self {
            flags: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn set(&self, flag: impl Into<String>, value: bool) {
        let mut flags = self.flags.write().await;
        flags.insert(flag.into(), value);
    }

    pub async fn is_enabled(&self, flag: &str) -> bool {
        let flags = self.flags.read().await;
        flags.get(flag).copied().unwrap_or(false)
    }

    pub async fn remove(&self, flag: &str) {
        let mut flags = self.flags.write().await;
        flags.remove(flag);
    }
}

/// Conditional effect execution
pub trait ConditionalExt<T, E, R> {
    /// Execute effect only if condition is true
    fn when(self, condition: bool) -> Effect<Option<T>, E, R>;

    /// Execute effect only if feature flag is enabled
    fn when_feature(self, store: Arc<FeatureFlagStore>, flag: impl Into<String>) -> Effect<Option<T>, E, R>;

    /// Execute effect only if predicate returns true
    fn when_pred<F>(self, predicate: F) -> Effect<Option<T>, E, R>
    where
        F: Fn(&R) -> bool + Send + Sync + Clone + 'static;
}

impl<T, E, R> ConditionalExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn when(self, condition: bool) -> Effect<Option<T>, E, R> {
        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();

            Box::pin(async move {
                if condition {
                    effect.run(ctx).await.map(Some)
                } else {
                    Ok(None)
                }
            })
        })
    }

    fn when_feature(self, store: Arc<FeatureFlagStore>, flag: impl Into<String>) -> Effect<Option<T>, E, R> {
        let flag = flag.into();

        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let store = store.clone();
            let flag = flag.clone();

            Box::pin(async move {
                if store.is_enabled(&flag).await {
                    effect.run(ctx).await.map(Some)
                } else {
                    Ok(None)
                }
            })
        })
    }

    fn when_pred<F>(self, predicate: F) -> Effect<Option<T>, E, R>
    where
        F: Fn(&R) -> bool + Send + Sync + Clone + 'static,
    {
        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let predicate = predicate.clone();

            Box::pin(async move {
                if predicate(&ctx) {
                    effect.run(ctx).await.map(Some)
                } else {
                    Ok(None)
                }
            })
        })
    }
}

/// A/B testing support
#[derive(Debug, Clone)]
pub struct AbTestConfig {
    pub test_name: String,
    pub variant_a_weight: f64,
    pub variant_b_weight: f64,
}

/// A/B test extension
pub trait AbTestExt<T, E, R> {
    /// A/B test between two effects
    fn ab_test(self, variant_b: Effect<T, E, R>, config: AbTestConfig) -> Effect<T, E, R>;
}

impl<T, E, R> AbTestExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn ab_test(self, variant_b: Effect<T, E, R>, config: AbTestConfig) -> Effect<T, E, R> {
        Effect::new(move |ctx: R| {
            let variant_a = self.clone();
            let variant_b = variant_b.clone();
            let ctx = ctx.clone();
            let total_weight = config.variant_a_weight + config.variant_b_weight;
            let a_threshold = config.variant_a_weight / total_weight;

            Box::pin(async move {
                #[cfg(feature = "rand")]
                {
                    let use_a = rand::random::<f64>() < a_threshold;
                    if use_a {
                        variant_a.run(ctx).await
                    } else {
                        variant_b.run(ctx).await
                    }
                }
                #[cfg(not(feature = "rand"))]
                {
                    // Default to variant_a when rand is not available
                    variant_a.run(ctx).await
                }
            })
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_conditional_when() {
        let effect = Effect::<i32, EffectError, ()>::success(42).when(true);
        let result = effect.run(()).await;
        assert_eq!(result.unwrap(), Some(42));

        let effect = Effect::<i32, EffectError, ()>::success(42).when(false);
        let result = effect.run(()).await;
        assert_eq!(result.unwrap(), None);
    }

    #[tokio::test]
    async fn test_feature_flag() {
        let store = Arc::new(FeatureFlagStore::new());
        store.set("my-feature", true).await;

        let effect = Effect::<i32, EffectError, ()>::success(42)
            .when_feature(store.clone(), "my-feature");
        let result = effect.run(()).await;
        assert_eq!(result.unwrap(), Some(42));

        // Disabled feature
        store.set("my-feature", false).await;
        let effect = Effect::<i32, EffectError, ()>::success(42)
            .when_feature(store.clone(), "my-feature");
        let result = effect.run(()).await;
        assert_eq!(result.unwrap(), None);
    }
}
