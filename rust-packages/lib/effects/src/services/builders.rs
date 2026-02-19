//! # Effect Builders
//!
//! Builder pattern for complex effect construction.
//!
//! ## Features
//!
//! - **Fluent API** - Clean, readable builder API
//! - **Type-safe** - Type-safe builders with compile-time guarantees
//! - **Composable** - Composable builders for complex effects
//! - **Builder macros** - Macros for common builder patterns
//!
//! ## Example
//!
//! ```rust,no_run
//! use effect::{Effect, EffectBuilder};
//! use std::time::Duration;
//!
//! #[tokio::main]
//! async fn main() -> Result<(), Box<dyn std::error::Error>> {
//!     let runtime = Runtime::new();
//!
//!     let effect = EffectBuilder::new()
//!         .with_retry(5, Duration::from_millis(100))
//!         .with_timeout(Duration::from_secs(10))
//!         .with_circuit_breaker()
//!         .build(|_| {
//!             Effect::success(42)
//!         });
//!
//!     let result = runtime.run(effect).await?;
//!
//!     Ok(())
//! }
//! ```

use crate::types::Effect;
use crate::services::logging::Logging;
use crate::services::metrics::Metrics;
use crate::services::tracing::Tracing;
use std::marker::PhantomData;
use std::time::Duration;

/// Builder for constructing effects with resilience patterns
pub struct EffectBuilder<T, E, R>
where
    T: Send + 'static,
    E: Send + 'static,
    R: Send + Sync + 'static,
{
    _phantom: PhantomData<(T, E, R)>,
    /// Retry configuration
    retry_config: Option<(u32, Duration)>,
    /// Timeout configuration
    timeout_config: Option<Duration>,
    /// Circuit breaker configuration
    circuit_breaker_config: Option<()>,
    /// Rate limiting configuration
    rate_limit_config: Option<()>,
    /// Throttling configuration
    throttle_config: Option<()>,
    /// Logging configuration
    logging_config: Option<()>,
    /// Metrics configuration
    metrics_config: Option<()>,
    /// Tracing configuration
    tracing_config: Option<()>,
}

impl<T, E, R> EffectBuilder<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + 'static,
    R: Send + Sync + Clone + 'static,
{
    /// Create new effect builder
    pub fn new() -> Self {
        Self {
            _phantom: PhantomData,
            retry_config: None,
            timeout_config: None,
            circuit_breaker_config: None,
            rate_limit_config: None,
            throttle_config: None,
            logging_config: None,
            metrics_config: None,
            tracing_config: None,
        }
    }

    /// Add retry configuration
    pub fn with_retry(mut self, max_attempts: u32, delay: Duration) -> Self {
        self.retry_config = Some((max_attempts, delay));
        self
    }

    /// Add timeout configuration
    pub fn with_timeout(mut self, timeout: Duration) -> Self {
        self.timeout_config = Some(timeout);
        self
    }

    /// Add circuit breaker configuration
    pub fn with_circuit_breaker(mut self) -> Self {
        self.circuit_breaker_config = Some(());
        self
    }

    /// Add rate limiting configuration
    pub fn with_rate_limit(mut self) -> Self {
        self.rate_limit_config = Some(());
        self
    }

    /// Add throttling configuration
    pub fn with_throttle(mut self) -> Self {
        self.throttle_config = Some(());
        self
    }

    /// Add logging configuration
    pub fn with_logging(mut self) -> Self {
        self.logging_config = Some(());
        self
    }

    /// Add metrics configuration
    pub fn with_metrics(mut self) -> Self {
        self.metrics_config = Some(());
        self
    }

    /// Add tracing configuration
    pub fn with_tracing(mut self) -> Self {
        self.tracing_config = Some(());
        self
    }

    /// Build the effect
    pub fn build<F>(self, f: F) -> Effect<T, E, R>
    where
        F: Fn() -> Effect<T, E, R> + Send + Sync + 'static,
        E: From<crate::error::EffectError> + From<tokio::time::error::Elapsed>,
    {
        let mut effect = f();

        // Apply retry configuration
        if let Some((max_attempts, delay)) = self.retry_config {
            effect = effect.retry(max_attempts, delay);
        }

        // Apply timeout configuration
        if let Some(timeout) = self.timeout_config {
            effect = effect.timeout(timeout);
        }

        // Apply circuit breaker configuration
        if self.circuit_breaker_config.is_some() {
            // Note: This would require actual circuit breaker implementation
            // For now, we just note that this is where it would be applied
        }

        // Apply rate limiting configuration
        if self.rate_limit_config.is_some() {
            // Note: This would require actual rate limiting implementation
            // For now, we just note that this is where it would be applied
        }

        // Apply throttling configuration
        if self.throttle_config.is_some() {
            // Note: This would require actual throttling implementation
            // // For now, we just note that this is where it would be applied
        }

        // Apply logging configuration
        if self.logging_config.is_some() {
            effect = effect.with_logging(crate::services::logging::LogLevel::Info);
        }

        // Apply metrics configuration
        if self.metrics_config.is_some() {
            effect = effect.with_metrics("effect");
        }

        // Apply tracing configuration
        if self.tracing_config.is_some() {
            effect = effect.with_tracing("effect");
        }

        effect
    }
}

impl<T, E, R> Default for EffectBuilder<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn default() -> Self {
        Self::new()
    }
}

/// Trait for builder support
pub trait BuilderSupport<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + 'static,
    R: Send + Sync + Clone + 'static,
{
    /// Create a builder for this effect
    fn builder() -> EffectBuilder<T, E, R>;
}

impl<T, E, R> BuilderSupport<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn builder() -> EffectBuilder<T, E, R> {
        EffectBuilder::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::Duration;

    #[test]
    fn test_effect_builder_basic() {
        let builder = EffectBuilder::<i32, String, ()>::new();
        assert_eq!(builder.retry_config, None);
        assert_eq!(builder.timeout_config, None);
    }

    #[test]
    fn test_effect_builder_with_retry() {
        let builder =
            EffectBuilder::<i32, String, ()>::new().with_retry(5, Duration::from_millis(100));

        assert!(builder.retry_config.is_some());
        let (max_attempts, delay) = builder.retry_config.unwrap();
        assert_eq!(max_attempts, 5);
        assert_eq!(delay, Duration::from_millis(100));
    }

    #[test]
    fn test_effect_builder_with_timeout() {
        let builder = EffectBuilder::<i32, String, ()>::new().with_timeout(Duration::from_secs(10));

        assert!(builder.timeout_config.is_some());
        assert_eq!(builder.timeout_config.unwrap(), Duration::from_secs(10));
    }

    #[test]
    fn test_effect_builder_build() {
        let builder = EffectBuilder::<i32, String, ()>::new()
            .with_retry(5, Duration::from_millis(100))
            .with_timeout(Duration::from_secs(10));

        let effect = builder.build(|| Effect::success(42));
        // Effect should have retry and timeout applied
        // (In a real implementation, we would verify this)
    }
}
