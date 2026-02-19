//! # Error Recovery Strategies
//!
//! Error recovery strategies for handling failures gracefully.
//!
//! ## Features
//!
//! - **Retry with backoff** - Retry operations with exponential backoff
//! - **Fallback values** - Provide fallback values on failure
//! - **Error handlers** - Custom error handling logic
//! - **Recovery policies** - Define recovery policies for different error types
//!
//! ## Example
//!
//! ```rust,no_run
//! use effect::{Effect, Runtime};
//! use effect::services::error_recovery::ErrorRecovery;
//!
//! #[tokio::main]
//! async fn main() -> Result<(), Box<dyn std::error::Error>> {
//!     let runtime = Runtime::new();
//!
//!     let effect = Effect::fail(MyError::ConnectionError("...".to_string()))
//!         .recover_with(|error| {
//!             match error {
//!                 MyError::ConnectionError(_) => Effect::success(42),
//!                 _ => Effect::fail(error),
//!             }
//!         });
//!
//!     let result = runtime.run(effect).await?;
//!
//!     Ok(())
//! }
//! ```

use crate::types::Effect;
use std::future::Future;
use std::pin::Pin;
use std::time::Duration;

/// Error recovery strategies
pub trait ErrorRecovery<T, E, R>
where
    T: Send + 'static,
    E: Send + Clone + 'static,
    R: Send + Sync + Clone + 'static,
{
    /// Recover from error with fallback value
    fn recover_with<F>(self, f: F) -> Effect<T, E, R>
    where
        F: Fn(E) -> T + Send + Sync + Clone + 'static;

    /// Recover from error with fallback effect
    fn recover_with_effect<F>(self, f: F) -> Effect<T, E, R>
    where
        F: Fn(E) -> Effect<T, E, R> + Send + Sync + Clone + 'static;

    /// Retry with exponential backoff
    fn retry_with_backoff(self, max_attempts: u32, initial_delay: Duration) -> Effect<T, E, R>;

    /// Retry with custom backoff strategy
    fn retry_with_backoff_strategy<F>(self, max_attempts: u32, backoff_fn: F) -> Effect<T, E, R>
    where
        F: Fn(u32) -> Duration + Send + Sync + Clone + 'static;
}

impl<T, E, R> ErrorRecovery<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn recover_with<F>(self, f: F) -> Effect<T, E, R>
    where
        F: Fn(E) -> T + Send + Sync + Clone + 'static,
    {
        Effect::new(move |ctx: R| {
            let effect = self.inner.clone();
            let f = f.clone();

            Box::pin(async move {
                match effect(ctx).await {
                    Ok(value) => Ok(value),
                    Err(error) => Ok(f(error)),
                }
            })
        })
    }

    fn recover_with_effect<F>(self, f: F) -> Effect<T, E, R>
    where
        F: Fn(E) -> Effect<T, E, R> + Send + Sync + Clone + 'static,
    {
        Effect::new(move |ctx: R| {
            let effect = self.inner.clone();
            let f = f.clone();
            let ctx = ctx.clone();

            Box::pin(async move {
                match effect(ctx.clone()).await {
                    Ok(value) => Ok(value),
                    Err(error) => f(error).run(ctx).await,
                }
            })
        })
    }

    fn retry_with_backoff(self, max_attempts: u32, initial_delay: Duration) -> Effect<T, E, R>
    where
        T: Send + 'static,
        E: Send + Clone + 'static,
        R: Send + Sync + Clone + 'static,
    {
        self.retry_with_backoff_strategy(max_attempts, move |attempt| {
            initial_delay * 2u32.pow(attempt)
        })
    }

    fn retry_with_backoff_strategy<F>(self, max_attempts: u32, backoff_fn: F) -> Effect<T, E, R>
    where
        F: Fn(u32) -> Duration + Send + Sync + Clone + 'static,
    {
        Effect::new(move |ctx: R| {
            let effect = self.inner.clone();
            let ctx = ctx.clone();
            let backoff_fn = backoff_fn.clone();

            Box::pin(async move {
                let mut last_error = None;

                for attempt in 0..max_attempts {
                    match effect(ctx.clone()).await {
                        Ok(value) => return Ok(value),
                        Err(error) => {
                            last_error = Some(error);

                            if attempt < max_attempts - 1 {
                                let delay = backoff_fn(attempt);
                                tokio::time::sleep(delay).await;
                            }
                        }
                    }
                }

                Err(last_error.unwrap())
            })
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::error::EffectError;

    #[test]
    fn test_recover_with() {
        let effect: Effect<i32, EffectError, _> = Effect::failure(EffectError::new("test error"));
        let effect = effect.recover_with(|_| 42);

        let runtime = crate::services::Runtime::new();
        let result = tokio::runtime::Runtime::new()
            .expect("Failed to create runtime")
            .block_on(async { runtime.run(effect, ()).await });

        assert_eq!(result.unwrap(), 42);
    }

    #[test]
    fn test_recover_with_effect() {
        let effect: Effect<i32, EffectError, _> = Effect::failure(EffectError::new("test error"));
        let effect = effect.recover_with_effect(|_| Effect::success(42));

        let runtime = crate::services::Runtime::new();
        let result = tokio::runtime::Runtime::new()
            .expect("Failed to create runtime")
            .block_on(async { runtime.run(effect, ()).await });

        assert_eq!(result.unwrap(), 42);
    }
}
