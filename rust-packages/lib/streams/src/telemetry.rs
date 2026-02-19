//! Telemetry initialization for the streaming library
//!
//! This module provides utilities for setting up logging and tracing
//! for streaming operations.

use tracing_subscriber::{EnvFilter, FmtSubscriber};

/// Initialize the tracing subscriber for streaming operations
///
/// This function sets up a global tracing subscriber with configurable
/// log levels via environment variables.
///
/// # Environment Variables
///
/// - `RUST_LOG`: Set the log level (e.g., `info`, `debug`, `trace`)
/// - `STREAMING_LOG`: Set streaming-specific log level (e.g., `streaming=debug`)
///
/// # Example
///
/// ```rust,no_run
/// use streaming::telemetry::init_subscriber;
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
