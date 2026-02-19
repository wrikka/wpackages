use crate::types::effect::Effect;

/// Combinators for working with multiple effects
impl<T, E, R> Effect<T, E, R>
where
    T: Send + 'static,
    E: Send + 'static,
    R: Send + Sync + Clone + 'static,
{
    /// Combine two effects, keeping the first success
    pub fn and_then<U, F>(self, f: F) -> Effect<U, E, R>
    where
        U: Send + 'static,
        F: Fn(T) -> Effect<U, E, R> + Send + Sync + Clone + 'static,
    {
        self.flat_map(f)
    }

    /// Combine two effects, keeping the first success (alias for and_then)
    pub fn bind<U, F>(self, f: F) -> Effect<U, E, R>
    where
        U: Send + 'static,
        F: Fn(T) -> Effect<U, E, R> + Send + Sync + Clone + 'static,
    {
        self.flat_map(f)
    }

    /// Run an effect and discard the result
    pub fn unit(self) -> Effect<(), E, R> {
        self.map(|_| ())
    }

    /// Tap into the effect for side effects
    pub fn tap<F>(self, f: F) -> Effect<T, E, R>
    where
        F: Fn(&T) + Send + Sync + Clone + 'static,
    {
        self.map(move |value| {
            f(&value);
            value
        })
    }
}

/// Combine multiple effects into one
pub fn all<T, E, R>(effects: Vec<Effect<T, E, R>>) -> Effect<Vec<T>, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + 'static,
    R: Send + Sync + Clone + 'static,
{
    Effect::new(move |ctx: R| {
        let effects = effects.clone();
        let ctx = ctx.clone();
        Box::pin(async move {
            let mut results = Vec::with_capacity(effects.len());
            for effect in effects {
                match effect.run(ctx.clone()).await {
                    Ok(value) => results.push(value),
                    Err(e) => return Err(e),
                }
            }
            Ok(results)
        })
    })
}

/// Race multiple effects, return the first to complete
pub fn race<T, E, R>(effects: Vec<Effect<T, E, R>>) -> Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<tokio::task::JoinError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    Effect::new(move |ctx: R| {
        let effects = effects.clone();
        let ctx = ctx.clone();
        Box::pin(async move {
            let mut tasks = Vec::new();
            for effect in effects {
                let ctx = ctx.clone();
                tasks.push(tokio::spawn(async move { effect.run(ctx).await }));
            }

            let (result, _, _) = futures::future::select_all(tasks).await;
            result?
        })
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::error::EffectError;

    #[tokio::test]
    async fn test_effect_unit() {
        let effect = Effect::<i32, EffectError, _>::success(42).unit();
        let result = effect.run(()).await;
        assert_eq!(result, Ok(()));
    }

    #[tokio::test]
    async fn test_effect_tap() {
        let called = std::sync::Arc::new(std::sync::atomic::AtomicBool::new(false));
        let called_clone = called.clone();
        let effect = Effect::<i32, EffectError, _>::success(42).tap(move |x| {
            called_clone.store(true, std::sync::atomic::Ordering::SeqCst);
            assert_eq!(*x, 42);
        });
        let result = effect.run(()).await;
        assert_eq!(result.unwrap(), 42);
        assert!(called.load(std::sync::atomic::Ordering::SeqCst));
    }

    #[tokio::test]
    async fn test_all() {
        let effects = vec![
            Effect::<i32, EffectError, _>::success(1),
            Effect::<i32, EffectError, _>::success(2),
            Effect::<i32, EffectError, _>::success(3),
        ];
        let effect = all(effects);
        let result = effect.run(()).await;
        assert_eq!(result, Ok(vec![1, 2, 3]));
    }

    #[tokio::test]
    async fn test_race() {
        let effects = vec![
            Effect::<i32, EffectError, _>::new(|_| {
                Box::pin(async move {
                    tokio::time::sleep(std::time::Duration::from_millis(100)).await;
                    Ok(1)
                })
            }),
            Effect::<i32, EffectError, _>::new(|_| {
                Box::pin(async move {
                    tokio::time::sleep(std::time::Duration::from_millis(10)).await;
                    Ok(2)
                })
            }),
        ];
        let effect = race(effects);
        let result = effect.run(()).await;
        assert_eq!(result.unwrap(), 2);
    }
}
