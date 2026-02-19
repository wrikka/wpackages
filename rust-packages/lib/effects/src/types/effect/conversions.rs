//! From implementations for Effect type
//!
//! Provides ergonomic conversions from common Rust types to Effect.

use crate::error::EffectError;
use crate::types::Effect;
use std::future::Future;
use std::pin::Pin;

// From Result for Effect
impl<T, E, R, V> From<Result<V, E>> for Effect<T, E, R>
where
    T: From<V> + Clone + Send + Sync + 'static,
    E: Clone + Send + Sync + From<EffectError> + 'static,
    R: Send + Sync + 'static,
{
    fn from(result: Result<V, E>) -> Self {
        match result {
            Ok(v) => Effect::success(T::from(v)),
            Err(e) => Effect::failure(e),
        }
    }
}

// From Option for Effect (None becomes EffectError)
impl<T, R> From<Option<T>> for Effect<T, EffectError, R>
where
    T: Clone + Send + Sync + 'static,
    R: Send + Sync + 'static,
{
    fn from(opt: Option<T>) -> Self {
        match opt {
            Some(v) => Effect::success(v),
            None => Effect::failure(EffectError::EffectFailed("Option was None".to_string())),
        }
    }
}

// From async block for Effect
impl<T, E, R, F, Fut> From<F> for Effect<T, E, R>
where
    F: Fn() -> Fut + Send + Sync + Clone + 'static,
    Fut: Future<Output = Result<T, E>> + Send + 'static,
    R: Send + Sync + 'static,
{
    fn from(f: F) -> Self {
        Effect::new(move |_ctx| {
            let f = f.clone();
            Box::pin(async move { f().await })
        })
    }
}
