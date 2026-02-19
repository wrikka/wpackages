use crate::error::EffectError;
use crate::types::effect::Effect;
use std::future::Future;
use std::pin::Pin;
use std::time::Duration;

/// Parallel execution effects
impl<T, E, R> Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    /// Execute effects in parallel
    pub fn parallel(self, concurrency: usize) -> Effect<Vec<T>, E, R> {
        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            Box::pin(async move {
                let mut tasks = Vec::new();
                for _ in 0..concurrency {
                    let effect = effect.clone();
                    let ctx = ctx.clone();
                    tasks.push(tokio::spawn(async move { effect.run(ctx).await }));
                }

                let mut results = Vec::new();
                for task in tasks {
                    match task.await {
                        Ok(Ok(v)) => results.push(v),
                        Ok(Err(e)) => return Err(e),
                        Err(_) => {
                            return Err(EffectError::EffectFailed("Task failed".to_string()).into())
                        }
                    }
                }
                Ok(results)
            })
        })
    }

    /// Fork effects into separate tasks
    pub fn fork(self) -> Effect<T, E, R> {
        Effect::new(move |ctx: R| {
            let effect = self.clone();
            Box::pin(async move {
                let ctx = ctx.clone();
                tokio::spawn(async move { effect.run(ctx).await })
                    .await
                    .map_err(|_| EffectError::EffectFailed("Fork failed".to_string()).into())?
            })
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_parallel() {
        let effect = Effect::<i32, EffectError, _>::success(42).parallel(3);
        let result = effect.run(()).await;
        assert!(result.is_ok());
        assert_eq!(result.unwrap().len(), 3);
    }

    #[tokio::test]
    async fn test_fork() {
        let effect = Effect::<i32, EffectError, _>::success(42).fork();
        let result = effect.run(()).await;
        assert_eq!(result, Ok(42));
    }
}
