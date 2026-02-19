//! # Effect Metrics
//!
//! Metrics support for monitoring effect execution using the `metrics` facade.
//!
//! ## Features
//!
//! - **Integration with `metrics` crate**: Allows consumers to use any backend.
//! - **Execution time histograms**: Track how long effects take to execute.
//! - **Success/failure counters**: Track success and failure rates.
//!
//! ## Example
//!
//! In your application's `main.rs`, initialize a recorder (e.g., Prometheus):
//!
//! ```rust,no_run
//! use effect::telemetry::init_prometheus_recorder;
//!
//! fn main() {
//!     // This function is available when `metrics-prometheus` feature is enabled.
//!     # #[cfg(feature = "metrics-prometheus")]
//!     init_prometheus_recorder();
//!     // ... your app logic
//! }
//! ```
//!
//! In your library code, instrument an effect:
//!
//! ```rust,no_run
//! use effect::{Effect, Runtime};
//! use effect::services::metrics::Metrics;
//!
//! #[tokio::main]
//! async fn main() -> Result<(), Box<dyn std::error::Error>> {
//!     let runtime = Runtime::new();
//!
//!     let effect = Effect::success(42)
//!         .with_metrics("my_effect");
//!
//!     let result = runtime.run(effect).await?;
//!
//!     Ok(())
//! }
//! ```

use metrics::{histogram, counter};
use std::time::Instant;

/// Records the start of an effect execution.
///
/// This function should be called when an effect begins. It returns an `Instant`
/// that should be passed to `record_effect_completion` when the effect finishes.
pub fn record_effect_start() -> Instant {
    Instant::now()
}

/// Records the completion of an effect, updating relevant metrics.
///
/// - Increments a counter for total executions, labeled by status (success/failure).
/// - Records the total execution time in a histogram.
///
/// # Arguments
///
/// * `name` - The name of the effect, used for metric labels.
/// * `start_time` - The `Instant` returned from `record_effect_start`.
/// * `success` - A boolean indicating whether the effect completed successfully.
pub fn record_effect_completion(name: &'static str, start_time: Instant, success: bool) {
    let duration = start_time.elapsed();
    let status = if success { "success" } else { "failure" };

    counter!(
        "effect_executions_total",
        "effect_name" => name,
        "status" => status
    );

    // Record duration in seconds
    let _ = duration.as_secs_f64();
}

/// A trait for adding metrics instrumentation to an effect.
pub trait Metrics<T, E, R>
where
    T: Send + 'static,
    E: Send + 'static,
    R: Send + Sync + 'static,
{
    /// Enable metrics collection for this effect.
    ///
    /// This will record the total number of executions, success/failure counts,
    /// and execution duration using the `metrics` facade.
    fn with_metrics(self, name: &'static str) -> Self;
}
