//! # Effect Assertions
//!
//! Assertion utilities for testing effects.
//!
//! ## Features
//!
//! - **Assert success** - Assert that effect succeeds
//! - **Assert failure** - Assert that effect fails
//! - **Assert values** - Assert effect returns expected value
//! - **Assert errors** - Assert effect returns expected error
//!
//! ## Example
//!
//! ```rust,no_run
//! use effect::{Effect, Runtime};
//! use effect::services::assertions::EffectAssertions;
//!
//! #[tokio::test]
//! async fn test_effect() {
//!     let effect = Effect::success(42);
//!
//!     effect.assert_success(|value| {
//!         assert_eq!(value, 42);
//!     });
//! }
//! ```

use crate::types::effect::Effect;
use std::fmt::Debug;

/// An extension trait providing assertion methods for `Effect`.
#[async_trait::async_trait]
pub trait EffectAssertions<T, E, R> {
    /// Asserts that the effect succeeds and allows inspecting the value.
    async fn should_succeed_and<F>(self, ctx: R, f: F)
    where
        F: FnOnce(T) + Send;

    /// Asserts that the effect fails and allows inspecting the error.
    async fn should_fail_and<F>(self, ctx: R, f: F)
    where
        F: FnOnce(E) + Send;

    /// Asserts that the effect succeeds with a specific value.
    async fn should_succeed_with(self, ctx: R, expected: T)
    where
        T: PartialEq + Debug + Send;

    /// Asserts that the effect fails with a specific error.
    async fn should_fail_with(self, ctx: R, expected: E)
    where
        E: PartialEq + Debug + Send;
}

#[async_trait::async_trait]
impl<T, E, R> EffectAssertions<T, E, R> for Effect<T, E, R>
where
    T: Debug + Send + 'static,
    E: Debug + Send + 'static,
    R: Send + Sync + 'static,
{
    async fn should_succeed_and<F>(self, ctx: R, f: F)
    where
        F: FnOnce(T) + Send,
    {
        match self.run(ctx).await {
            Ok(value) => f(value),
            Err(error) => panic!(
                "Effect failed when it should have succeeded. Error: {:?}",
                error
            ),
        }
    }

    async fn should_fail_and<F>(self, ctx: R, f: F)
    where
        F: FnOnce(E) + Send,
    {
        match self.run(ctx).await {
            Ok(value) => panic!(
                "Effect succeeded when it should have failed. Value: {:?}",
                value
            ),
            Err(error) => f(error),
        }
    }

    async fn should_succeed_with(self, ctx: R, expected: T)
    where
        T: PartialEq + Debug + Send,
    {
        self.should_succeed_and(ctx, move |value| {
            assert_eq!(
                value, expected,
                "Effect succeeded with an unexpected value."
            );
        })
        .await;
    }

    async fn should_fail_with(self, ctx: R, expected: E)
    where
        E: PartialEq + Debug + Send,
    {
        self.should_fail_and(ctx, move |error| {
            assert_eq!(error, expected, "Effect failed with an unexpected error.");
        })
        .await;
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::error::EffectError;
    use crate::types::Effect;

    #[tokio::test]
    async fn test_should_succeed_and() {
        let effect = Effect::<_, EffectError, _>::success(42);
        effect
            .should_succeed_and((), |value| {
                assert_eq!(value, 42);
            })
            .await;
    }

    #[tokio::test]
    async fn test_should_fail_and() {
        let effect: Effect<i32, _, _> =
            Effect::failure(EffectError::EffectFailed("test error".to_string()));
        effect
            .should_fail_and((), |error| {
                assert!(matches!(error, EffectError::EffectFailed(msg) if msg == "test error"));
            })
            .await;
    }

    #[tokio::test]
    async fn test_should_succeed_with() {
        let effect = Effect::<_, EffectError, _>::success(42);
        effect.should_succeed_with((), 42).await;
    }

    #[tokio::test]
    #[should_panic(expected = "Effect succeeded with an unexpected value.")]
    async fn test_should_succeed_with_fail() {
        let effect = Effect::<_, EffectError, _>::success(42);
        effect.should_succeed_with((), 100).await;
    }
}
