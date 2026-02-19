//! # Performance Monitoring
//!
//! Performance monitoring tools for effect execution.
//!
//! ## Features
//!
//! - **Execution time metrics** - Track how long effects take to execute
//! - **Memory usage** - Monitor memory usage during execution
//! - **CPU usage** - Track CPU usage during execution
//! - **Performance hints** - Provide hints for optimization
//!
//! ## Example
//!
//! ```rust,no_run
//! use effect::{Effect, Runtime};
//! use effect::services::performance::PerformanceMonitoring;
//!
//! #[tokio::main]
//! async fn main() -> Result<(), Box<dyn std::error::Error>> {
//!     let runtime = Runtime::new();
//!
//!     let effect = Effect::success(42)
//!         .with_performance_monitoring(|metrics| {
//!             println!("Execution time: {:?}", metrics.duration);
//!             println!("Memory usage: {:?}", metrics.memory);
//!         });
//!
//!     let result = runtime.run(effect).await?;
//!
//!     Ok(())
//! }
//! ```

use crate::services::metrics::Metrics;
use crate::services::tracing::Tracing;
use crate::types::Effect;

/// A trait for adding performance monitoring instrumentation to an effect.
pub trait PerformanceMonitoring<T, E, R>
where
    T: Send + 'static,
    E: Send + 'static,
    R: Send + Sync + 'static,
{
    /// Enables performance monitoring for this effect.
    ///
    /// This is a convenience method that combines `with_tracing` and `with_metrics`
    /// to provide a holistic view of the effect's performance through logs, traces,
    /// and aggregated metrics.
    fn with_performance_monitoring(self, name: &'static str) -> Self;
}

impl<T, E, R> PerformanceMonitoring<T, E, R> for Effect<T, E, R>
where
    T: Send + 'static,
    E: Send + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_performance_monitoring(self, name: &'static str) -> Self {
        self.with_tracing(name).with_metrics(name)
    }
}
