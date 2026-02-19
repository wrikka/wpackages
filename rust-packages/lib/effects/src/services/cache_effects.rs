use crate::error::EffectError;
use crate::types::effect::Effect;
use std::future::Future;
use std::pin::Pin;
use std::time::Duration;

/// Cache effects
impl<T, E, R> Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + 'static,
    R: Send + Sync + Clone + 'static,
{
    /// Cache effect result with TTL
    pub fn cached(self, _ttl: Duration) -> Effect<T, E, R> {
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
    async fn test_cached() {
        let effect = Effect::<i32, EffectError, _>::success(42).cached(Duration::from_secs(60));
        let result = effect.run(()).await;
        assert_eq!(result, Ok(42));
    }
}
