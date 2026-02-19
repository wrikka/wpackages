use crate::error::EffectError;
use crate::types::effect::Effect;
use std::future::Future;
use std::pin::Pin;
use std::time::Duration;

/// Additional effect combinators and utilities
impl<T, E, R> Effect<T, E, R>
where
    T: Send + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    /// Race all effects and return all results
    pub fn race_all(self, other: Effect<T, E, R>) -> Effect<Vec<T>, E, R> {
        Effect::new(move |ctx: R| {
            let effect1 = self.clone();
            let effect2 = other.clone();
            let ctx1 = ctx.clone();
            let ctx2 = ctx;
            Box::pin(async move {
                let (r1, r2) = tokio::join!(
                    tokio::spawn(async move { effect1.run(ctx1).await }),
                    tokio::spawn(async move { effect2.run(ctx2).await })
                );

                let mut results = Vec::new();
                match r1 {
                    Ok(Ok(v)) => results.push(v),
                    _ => {}
                }
                match r2 {
                    Ok(Ok(v)) => results.push(v),
                    _ => {}
                }

                if results.is_empty() {
                    Err(EffectError::EffectFailed("All effects failed".to_string()).into())
                } else {
                    Ok(results)
                }
            })
        })
    }

    /// Refine error type
    pub fn refine<F, G>(self, f: G) -> Effect<T, F, R>
    where
        F: Send + 'static,
        G: Fn(E) -> F + Send + Sync + Clone + 'static,
    {
        Effect::new(move |ctx: R| {
            let effect = self.inner.clone();
            let f = f.clone();
            Box::pin(async move {
                match effect(ctx).await {
                    Ok(v) => Ok(v),
                    Err(e) => Err(f(e)),
                }
            })
        })
    }

    /// Catch all errors and handle them
    pub fn catch_all<F>(self, f: F) -> Effect<T, E, R>
    where
        T: Clone + Send + 'static,
        F: Fn(E) -> Effect<T, E, R> + Send + Sync + Clone + 'static,
    {
        Effect::new(move |ctx: R| {
            let effect = self.inner.clone();
            let f = f.clone();
            Box::pin(async move {
                match effect(ctx.clone()).await {
                    Ok(v) => Ok(v),
                    Err(e) => f(e).run(ctx).await,
                }
            })
        })
    }

    /// Using pattern for scoped resource usage
    pub fn using<A, F1, F2>(acquire: F1, use_: F2) -> Effect<T, E, R>
    where
        A: Send + Clone + 'static,
        F1: Fn() -> Pin<Box<dyn Future<Output = Result<A, E>> + Send>>
            + Send
            + Sync
            + Clone
            + 'static,
        F2: Fn(A) -> Pin<Box<dyn Future<Output = Result<T, E>> + Send>>
            + Send
            + Sync
            + Clone
            + 'static,
    {
        Effect::new(move |_ctx| {
            let acquire = acquire.clone();
            let use_ = use_.clone();
            Box::pin(async move {
                match acquire().await {
                    Ok(resource) => use_(resource).await,
                    Err(e) => Err(e),
                }
            })
        })
    }

    /// Debounce the effect
    pub fn debounce(self, duration: Duration) -> Effect<T, E, R>
    where
        T: Clone + Send + 'static,
    {
        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            Box::pin(async move {
                tokio::time::sleep(duration).await;
                effect.run(ctx).await
            })
        })
    }

    /// Throttle with time interval
    pub fn throttle_time(self, duration: Duration) -> Effect<T, E, R>
    where
        T: Clone + Send + 'static,
    {
        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            Box::pin(async move {
                let start = std::time::Instant::now();
                let result = effect.run(ctx).await;
                let elapsed = start.elapsed();
                if elapsed < duration {
                    tokio::time::sleep(duration - elapsed).await;
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
    async fn test_race_all() {
        let effect1 = Effect::<i32, EffectError, _>::success(1);
        let effect2 = Effect::<i32, EffectError, _>::success(2);
        let effect = effect1.race_all(effect2);
        let result = effect.run(()).await;
        assert!(result.is_ok());
        assert!(result.unwrap().len() > 0);
    }

    #[tokio::test]
    async fn test_refine() {
        let effect =
            Effect::<i32, EffectError, _>::failure(EffectError::EffectFailed("error".to_string()))
                .refine(|e| e.to_string());
        let result = effect.run(()).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_catch_all() {
        let effect =
            Effect::<i32, EffectError, _>::failure(EffectError::EffectFailed("error".to_string()))
                .catch_all(|_| Effect::success(42));
        let result = effect.run(()).await;
        assert_eq!(result, Ok(42));
    }

    #[tokio::test]
    async fn test_using() {
        let effect = Effect::<i32, EffectError, _>::using(
            || Box::pin(async { Ok("resource".to_string()) }),
            |r| Box::pin(async move { Ok(r.len() as i32) }),
        );
        let result = effect.run(()).await;
        assert_eq!(result, Ok(8));
    }

    #[tokio::test]
    async fn test_debounce() {
        let effect = Effect::<i32, EffectError, _>::success(42).debounce(Duration::from_millis(10));
        let start = std::time::Instant::now();
        let result = effect.run(()).await;
        let elapsed = start.elapsed();
        assert_eq!(result, Ok(42));
        assert!(elapsed >= Duration::from_millis(10));
    }

    #[tokio::test]
    async fn test_throttle_time() {
        let effect =
            Effect::<i32, EffectError, _>::success(42).throttle_time(Duration::from_millis(50));
        let start = std::time::Instant::now();
        let result = effect.run(()).await;
        let elapsed = start.elapsed();
        assert_eq!(result, Ok(42));
        assert!(elapsed >= Duration::from_millis(50));
    }
}
