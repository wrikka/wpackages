use crate::error::EffectError;
use crate::types::effect::Effect;
use std::future::Future;
use std::pin::Pin;

/// Stream processing effects
impl<T, E, R> Effect<T, E, R>
where
    T: Send + 'static,
    E: Send + Clone + 'static,
    R: Send + Sync + Clone + 'static,
{
    /// Process as stream
    pub fn stream(self) -> Effect<Vec<T>, E, R> {
        Effect::new(move |ctx| {
            let effect = self.clone();
            Box::pin(async move {
                match effect.run(ctx).await {
                    Ok(v) => Ok(vec![v]),
                    Err(e) => Err(e),
                }
            })
        })
    }

    /// Schedule execution
    pub fn schedule(self, delay: std::time::Duration) -> Effect<T, E, R> {
        Effect::new(move |ctx| {
            let effect = self.clone();
            Box::pin(async move {
                tokio::time::sleep(delay).await;
                effect.run(ctx).await
            })
        })
    }

    /// Queue effect
    pub fn queue(self) -> Effect<T, E, R> {
        Effect::new(move |ctx| {
            let effect = self.clone();
            Box::pin(async move { effect.run(ctx).await })
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_stream() {
        let effect = Effect::<i32, EffectError, _>::success(42).stream();
        let result = effect.run(()).await;
        assert_eq!(result, Ok(vec![42]));
    }

    #[tokio::test]
    async fn test_schedule() {
        let effect = Effect::<i32, EffectError, _>::success(42)
            .schedule(std::time::Duration::from_millis(10));
        let start = std::time::Instant::now();
        let result = effect.run(()).await;
        let elapsed = start.elapsed();
        assert_eq!(result, Ok(42));
        assert!(elapsed >= std::time::Duration::from_millis(10));
    }

    #[tokio::test]
    async fn test_queue() {
        let effect = Effect::<i32, EffectError, _>::success(42).queue();
        let result = effect.run(()).await;
        assert_eq!(result, Ok(42));
    }
}
