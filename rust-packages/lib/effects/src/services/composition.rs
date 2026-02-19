//! # Effect Composition Helpers
//!
//! Helpers for composing effects.
//!
//! ## Features
//!
//! - **Compose helpers** - Simplify effect composition
//! - **Effect templates** - Reusable effect patterns
//! - **Effect macros** - Macros for common patterns
//! - **Effect combinators** - Compose effects easily
//!
//! ## Example
//!
//! ```rust,no_run
//! use effect::{Effect, compose};
//!
//! let effect = compose!(
//!     retry(5, Duration::from_millis(100)),
//!     timeout(Duration::from_secs(10)),
//!     circuit_breaker(),
//!     map(|x| x * 2)
//! )(|_| {
//!     Effect::success(42)
//! });
//!
//! let result = runtime.run(effect).await?;
//! ```

use crate::types::Effect;
use std::time::Duration;

/// Composes an `Effect` with various transformations using a fluent builder pattern.
///
/// # Example
///
/// ```rust,no_run
/// # use effect::types::Effect;
/// # use effect::services::composition::EffectComposer;
/// # use std::time::Duration;
/// # #[tokio::main]
/// # async fn main() {
/// let effect = EffectComposer::new(Effect::success(42))
///     .map(|x| x * 2)
///     .timeout(Duration::from_secs(10))
///     .build();
///
/// // let result = effect.run(()).await;
/// # }
/// ```
pub struct EffectComposer<T, E, R> {
    effect: Effect<T, E, R>,
}

impl<T, E, R> EffectComposer<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + 'static,
    R: Send + Sync + Clone + 'static,
{
    /// Creates a new composer from an initial effect.
    pub fn new(effect: Effect<T, E, R>) -> Self {
        Self { effect }
    }

    /// Applies a `map` transformation to the effect.
    pub fn map<F, U>(self, f: F) -> EffectComposer<U, E, R>
    where
        F: Fn(T) -> U + Send + Sync + Clone + 'static,
        U: Send + Clone + 'static,
    {
        EffectComposer::new(self.effect.map(f))
    }

    /// Applies a `flat_map` transformation to the effect.
    pub fn flat_map<F, U>(self, f: F) -> EffectComposer<U, E, R>
    where
        F: Fn(T) -> Effect<U, E, R> + Send + Sync + Clone + 'static,
        U: Send + Clone + 'static,
    {
        EffectComposer::new(self.effect.flat_map(f))
    }

    /// Adds a timeout to the effect.
    pub fn timeout(self, duration: Duration) -> Self
    where
        E: From<tokio::time::error::Elapsed>,
    {
        EffectComposer::new(self.effect.timeout(duration))
    }

    /// Adds a retry policy to the effect.
    pub fn retry(self, max_attempts: u32, delay: Duration) -> Self
    where
        E: From<crate::error::EffectError>,
    {
        EffectComposer::new(self.effect.retry(max_attempts, delay))
    }

    /// Finishes the composition and returns the final `Effect`.
    pub fn build(self) -> Effect<T, E, R> {
        self.effect
    }
}
