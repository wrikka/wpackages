//! # Effect Tracing
//!
//! Tracing support for effect execution.
//!
//! ## Features
//!
//! - **Structured spans** - Create structured spans for effect execution
//! - **Event logging** - Log events during effect execution
//! - **Context propagation** - Propagate context across effect boundaries
//! - **Distributed tracing** - Support for distributed tracing
//!
//! ## Example
//!
//! ```rust,no_run
//! use effect::{Effect, Runtime};
//! use effect::services::tracing::Tracing;
//!
//! #[tokio::main]
//! async fn main() -> Result<(), Box<dyn std::error::Error>> {
//!     let runtime = Runtime::new();
//!
//!     let effect = Effect::success(42)
//!         .with_tracing("my_effect");
//!
//!     let result = runtime.run(effect).await?;
//!
//!     Ok(())
//! }
//! ```

/// A trait for adding tracing instrumentation to an effect.
pub trait Tracing<T, E, R>
where
    T: Send + 'static,
    E: Send + 'static,
    R: Send + Sync + 'static,
{
    /// Enable tracing for this effect.
    ///
    /// This will create a `tracing` span at the `INFO` level that records the
    /// execution of the effect.
    fn with_tracing(self, name: &'static str) -> Self;
}
