//! Telemetry initialization for the queue library
//!
//! This module provides utilities for setting up logging and tracing
//! for queue operations.

use tracing_subscriber::{EnvFilter, FmtSubscriber};

/// Initialize the tracing subscriber for queue operations
///
/// This function sets up a global tracing subscriber with configurable
/// log levels via environment variables.
///
/// # Environment Variables
///
/// - `RUST_LOG`: Set the log level (e.g., `info`, `debug`, `trace`)
/// - `QUEUE_LOG`: Set queue-specific log level (e.g., `queue=debug`)
///
/// # Example
///
/// ```rust,no_run
/// use queue::telemetry::init_subscriber;
///
/// fn main() {
///     init_subscriber();
///     // Your application code here
/// }
/// ```
///
/// # Default Behavior
///
/// If no environment variable is set, defaults to `info` level logging.
pub fn init_subscriber() {
    let filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("info"));

    let subscriber = FmtSubscriber::builder()
        .with_env_filter(filter)
        .finish();

    tracing::subscriber::set_global_default(subscriber)
        .expect("Failed to set tracing subscriber");
}
