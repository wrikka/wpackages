//! # Effect Mocking
//!
//! Mocking support for testing effects.
//!
//! ## Features
//!
//! - **Mock effects** - Create mock effects for testing
//! - **Stub effects** - Stub effects with predefined values
//! - **Spy effects** - Spy on effect calls
//! - **Verify calls** - Verify effect was called
//!
//! ## Example
//!
//! ```rust,no_run
//! use effect::{Effect, Runtime};
//! use effect::services::mocking::Mock;
//!
//! #[tokio::test]
//! async fn test_effect() {
//!     let mock = Mock::new(|_| {
//!         Effect::success(42)
//!     });
//!
//!     let effect = Effect::from(mock);
//!     let result = runtime.run(effect).await?;
//!
//!     assert_eq!(result, 42);
//!     mock.verify_called();
//! }
//! ```

use crate::types::effect::Effect;
use crate::EffectError;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::Arc;

/// Mock for testing effects
#[derive(Clone)]
pub struct Mock<T, E, R>
where
    T: Clone,
    E: Clone,
{
    /// Whether the mock was called
    called: Arc<AtomicBool>,
    /// Number of times the mock was called
    call_count: Arc<AtomicU64>,
    /// Mock implementation
    implementation: Arc<dyn Fn(R) -> Effect<T, E, R> + Send + Sync>,
}

impl<T, E, R> Mock<T, E, R>
where
    T: Clone + Send + Sync + 'static,
    E: Clone + Send + Sync + From<EffectError> + 'static,
    R: Send + Sync + 'static,
{
    /// Create new mock
    pub fn new<F>(f: F) -> Self
    where
        F: Fn(R) -> Effect<T, E, R> + Send + Sync + 'static,
    {
        Self {
            called: Arc::new(AtomicBool::new(false)),
            call_count: Arc::new(AtomicU64::new(0)),
            implementation: Arc::new(f),
        }
    }

    /// Create mock that returns success
    pub fn success(value: T) -> Self
    where
        E: Default + Send + Sync + 'static,
        R: Send + Sync + 'static,
    {
        Self::new(move |_| Effect::success(value.clone()))
    }

    /// Create mock that returns failure
    pub fn failure(error: E) -> Self
    where
        T: Default + Send + Sync + 'static,
        R: Send + Sync + 'static,
    {
        Self::new(move |_| Effect::failure(error.clone()))
    }

    /// Verify that the mock was called
    pub fn verify_called(&self) {
        assert!(self.called.load(Ordering::SeqCst), "Mock was not called");
    }

    /// Verify that the mock was called exactly n times
    pub fn verify_called_times(&self, n: u64) {
        let count = self.call_count.load(Ordering::SeqCst);
        assert_eq!(count, n, "Mock was called {} times, expected {}", count, n);
    }

    /// Get the number of times the mock was called
    pub fn call_count(&self) -> u64 {
        self.call_count.load(Ordering::SeqCst)
    }

    /// Get the mock implementation
    fn implementation(&self, context: R) -> Effect<T, E, R> {
        self.called.store(true, Ordering::SeqCst);
        self.call_count.fetch_add(1, Ordering::SeqCst);
        (self.implementation)(context)
    }
}

impl<T, E, R> From<Mock<T, E, R>> for Effect<T, E, R>
where
    T: Clone + Send + 'static,
    E: Clone + Send + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn from(mock: Mock<T, E, R>) -> Self {
        Effect::new(move |ctx: R| {
            // The mock.implementation returns an Effect. We need to execute it.
            let effect = (mock.implementation)(ctx.clone());
            Box::pin(async move { effect.run(ctx).await })
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::effect::Effect;

    #[tokio::test]
    async fn test_mock_success() {
        let mock = Mock::success(42i32);
        let effect = Effect::from(mock.clone());

        let result = effect.run(()).await.unwrap();
        assert_eq!(result, 42);
        mock.verify_called();
    }

    #[tokio::test]
    async fn test_mock_failure() {
        let mock = Mock::failure("test error".to_string());
        let effect: Effect<i32, String, _> = Effect::from(mock.clone());

        let result = effect.run(()).await;
        assert!(result.is_err());
        mock.verify_called();
    }

    #[tokio::test]
    async fn test_mock_call_count() {
        let mock = Mock::success(42i32);
        let effect = Effect::from(mock.clone());

        effect.run(()).await.unwrap();
        effect.run(()).await.unwrap();
        effect.run(()).await.unwrap();

        mock.verify_called_times(3);
    }

    #[tokio::test]
    async fn test_mock_custom() {
        let mock = Mock::new(|_| Effect::success(42i32));
        let effect = Effect::from(mock.clone());

        let result = effect.run(()).await.unwrap();
        assert_eq!(result, 42);
        mock.verify_called();
    }
}
