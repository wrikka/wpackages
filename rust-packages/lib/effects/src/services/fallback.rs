use crate::error::EffectError;
use crate::types::effect::Effect;
use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::Mutex;

/// Fallback configuration
#[derive(Debug, Clone)]
pub struct FallbackConfig {
    pub max_fallbacks: usize,
    pub delay_between_fallbacks: Duration,
    pub on_fallback_error: FallbackErrorStrategy,
}

impl Default for FallbackConfig {
    fn default() -> Self {
        Self {
            max_fallbacks: 3,
            delay_between_fallbacks: Duration::from_millis(0),
            on_fallback_error: FallbackErrorStrategy::Continue,
        }
    }
}

impl FallbackConfig {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn max_fallbacks(mut self, value: usize) -> Self {
        self.max_fallbacks = value;
        self
    }

    pub fn delay_between_fallbacks(mut self, duration: Duration) -> Self {
        self.delay_between_fallbacks = duration;
        self
    }

    pub fn on_fallback_error(mut self, strategy: FallbackErrorStrategy) -> Self {
        self.on_fallback_error = strategy;
        self
    }
}

#[derive(Debug, Clone, Copy)]
pub enum FallbackErrorStrategy {
    Continue,
    Stop,
}

/// Fallback extension trait for effects
pub trait FallbackExt<T, E, R> {
    /// Add a single fallback effect
    fn with_fallback<F>(self, fallback: F) -> Effect<T, E, R>
    where
        F: FnOnce() -> Effect<T, E, R> + Send + 'static;

    /// Add multiple fallback effects in order
    fn with_fallbacks(self, fallbacks: Vec<Effect<T, E, R>>) -> Effect<T, E, R>;

    /// Add fallback with configuration
    fn with_fallback_config<F>(self, fallback: F, config: FallbackConfig) -> Effect<T, E, R>
    where
        F: FnOnce() -> Effect<T, E, R> + Send + 'static;
}

impl<T, E, R> FallbackExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_fallback<F>(self, fallback: F) -> Effect<T, E, R>
    where
        F: FnOnce() -> Effect<T, E, R> + Send + 'static,
    {
        let fallback_effect = fallback();

        Effect::new(move |ctx: R| {
            let primary = self.clone();
            let fallback = fallback_effect.clone();
            let ctx = ctx.clone();

            Box::pin(async move {
                match primary.run(ctx.clone()).await {
                    Ok(value) => Ok(value),
                    Err(_) => fallback.run(ctx).await,
                }
            })
        })
    }

    fn with_fallbacks(self, fallbacks: Vec<Effect<T, E, R>>) -> Effect<T, E, R> {
        let fallbacks = Arc::new(Mutex::new(fallbacks));

        Effect::new(move |ctx: R| {
            let primary = self.clone();
            let fallbacks = fallbacks.clone();
            let ctx = ctx.clone();

            Box::pin(async move {
                // Try primary first
                match primary.run(ctx.clone()).await {
                    Ok(value) => return Ok(value),
                    Err(_) => {
                        // Try each fallback in order
                        let mut guard = fallbacks.lock().await;
                        for fallback in guard.iter() {
                            match fallback.clone().run(ctx.clone()).await {
                                Ok(value) => return Ok(value),
                                Err(_) => continue,
                            }
                        }
                        drop(guard);

                        // All fallbacks failed
                        Err(EffectError::EffectFailed(
                            "Primary and all fallbacks failed".to_string(),
                        )
                        .into())
                    }
                }
            })
        })
    }

    fn with_fallback_config<F>(self, fallback: F, config: FallbackConfig) -> Effect<T, E, R>
    where
        F: FnOnce() -> Effect<T, E, R> + Send + 'static,
    {
        let fallback_effect = fallback();
        let config = Arc::new(config);

        Effect::new(move |ctx: R| {
            let primary = self.clone();
            let fallback = fallback_effect.clone();
            let ctx = ctx.clone();
            let config = config.clone();

            Box::pin(async move {
                // Try primary
                match primary.run(ctx.clone()).await {
                    Ok(value) => return Ok(value),
                    Err(primary_err) => {
                        // Delay before fallback
                        if config.delay_between_fallbacks > Duration::from_millis(0) {
                            tokio::time::sleep(config.delay_between_fallbacks).await;
                        }

                        // Try fallback
                        match fallback.run(ctx.clone()).await {
                            Ok(value) => Ok(value),
                            Err(fallback_err) => {
                                match config.on_fallback_error {
                                    FallbackErrorStrategy::Stop => Err(primary_err),
                                    FallbackErrorStrategy::Continue => Err(fallback_err),
                                }
                            }
                        }
                    }
                }
            })
        })
    }
}

/// Conditional fallback based on error type
pub trait ConditionalFallbackExt<T, E, R> {
    /// Add fallback only for specific error condition
    fn with_conditional_fallback<F, C>(self, condition: C, fallback: F) -> Effect<T, E, R>
    where
        F: FnOnce() -> Effect<T, E, R> + Send + 'static,
        C: Fn(&E) -> bool + Send + Sync + 'static;
}

impl<T, E, R> ConditionalFallbackExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_conditional_fallback<F, C>(self, condition: C, fallback: F) -> Effect<T, E, R>
    where
        F: FnOnce() -> Effect<T, E, R> + Send + 'static,
        C: Fn(&E) -> bool + Send + Sync + 'static,
    {
        let fallback_effect = fallback();
        let condition = Arc::new(Mutex::new(condition));

        Effect::new(move |ctx: R| {
            let primary = self.clone();
            let fallback = fallback_effect.clone();
            let ctx = ctx.clone();
            let condition = condition.clone();

            Box::pin(async move {
                match primary.run(ctx.clone()).await {
                    Ok(value) => Ok(value),
                    Err(err) => {
                        let condition_fn = condition.lock().await;
                        if condition_fn(&err) {
                            drop(condition_fn);
                            fallback.run(ctx).await
                        } else {
                            Err(err)
                        }
                    }
                }
            })
        })
    }
}

/// Lazy fallback - only created when needed
pub trait LazyFallbackExt<T, E, R> {
    /// Add lazy fallback that's only evaluated on failure
    fn with_lazy_fallback<F>(self, fallback_factory: F) -> Effect<T, E, R>
    where
        F: Fn() -> Effect<T, E, R> + Send + Sync + 'static;
}

impl<T, E, R> LazyFallbackExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_lazy_fallback<F>(self, fallback_factory: F) -> Effect<T, E, R>
    where
        F: Fn() -> Effect<T, E, R> + Send + Sync + 'static,
    {
        let factory = Arc::new(Mutex::new(fallback_factory));

        Effect::new(move |ctx: R| {
            let primary = self.clone();
            let ctx = ctx.clone();
            let factory = factory.clone();

            Box::pin(async move {
                match primary.run(ctx.clone()).await {
                    Ok(value) => Ok(value),
                    Err(_) => {
                        let factory_fn = factory.lock().await;
                        let fallback = factory_fn();
                        drop(factory_fn);
                        fallback.run(ctx).await
                    }
                }
            })
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_fallback_success() {
        let effect = Effect::<i32, EffectError, ()>::new(|_| {
            Box::pin(async move { Err(EffectError::EffectFailed("primary failed".to_string())) })
        })
        .with_fallback(|| Effect::success(42));

        let result = effect.run(()).await;
        assert_eq!(result.unwrap(), 42);
    }

    #[tokio::test]
    async fn test_fallback_not_needed() {
        let effect = Effect::<i32, EffectError, ()>::success(100).with_fallback(|| Effect::success(42));

        let result = effect.run(()).await;
        assert_eq!(result.unwrap(), 100);
    }

    #[tokio::test]
    async fn test_multiple_fallbacks() {
        let fallbacks = vec![
            Effect::<i32, EffectError, ()>::new(|_| {
                Box::pin(async move { Err(EffectError::EffectFailed("fallback 1 failed".to_string())) })
            }),
            Effect::<i32, EffectError, ()>::new(|_| {
                Box::pin(async move { Err(EffectError::EffectFailed("fallback 2 failed".to_string())) })
            }),
            Effect::success(42),
        ];

        let effect = Effect::<i32, EffectError, ()>::new(|_| {
            Box::pin(async move { Err(EffectError::EffectFailed("primary failed".to_string())) })
        })
        .with_fallbacks(fallbacks);

        let result = effect.run(()).await;
        assert_eq!(result.unwrap(), 42);
    }

    #[tokio::test]
    async fn test_all_fallbacks_fail() {
        let fallbacks = vec![
            Effect::<i32, EffectError, ()>::new(|_| {
                Box::pin(async move { Err(EffectError::EffectFailed("fallback 1 failed".to_string())) })
            }),
            Effect::<i32, EffectError, ()>::new(|_| {
                Box::pin(async move { Err(EffectError::EffectFailed("fallback 2 failed".to_string())) })
            }),
        ];

        let effect = Effect::<i32, EffectError, ()>::new(|_| {
            Box::pin(async move { Err(EffectError::EffectFailed("primary failed".to_string())) })
        })
        .with_fallbacks(fallbacks);

        let result = effect.run(()).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_conditional_fallback() {
        let effect = Effect::<i32, EffectError, ()>::new(|_| {
            Box::pin(async move { Err(EffectError::EffectFailed("retryable".to_string())) })
        })
        .with_conditional_fallback(
            |e| e.to_string().contains("retryable"),
            || Effect::success(42),
        );

        let result = effect.run(()).await;
        assert_eq!(result.unwrap(), 42);
    }

    #[tokio::test]
    async fn test_conditional_fallback_not_triggered() {
        let effect = Effect::<i32, EffectError, ()>::new(|_| {
            Box::pin(async move { Err(EffectError::EffectFailed("fatal".to_string())) })
        })
        .with_conditional_fallback(
            |e| e.to_string().contains("retryable"),
            || Effect::success(42),
        );

        let result = effect.run(()).await;
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("fatal"));
    }

    #[tokio::test]
    async fn test_lazy_fallback() {
        let counter = Arc::new(Mutex::new(0));
        let counter_clone = counter.clone();

        let effect = Effect::<i32, EffectError, ()>::success(100).with_lazy_fallback(move || {
            let counter = counter_clone.clone();
            Effect::new(move |_| {
                let counter = counter.clone();
                Box::pin(async move {
                    let mut guard = counter.lock().await;
                    *guard += 1;
                    Ok(42)
                })
            })
        });

        let result = effect.run(()).await;
        assert_eq!(result.unwrap(), 100);

        // Fallback should not have been created
        let guard = counter.lock().await;
        assert_eq!(*guard, 0);
    }
}
