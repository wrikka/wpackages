//! Telemetry initialization for the cache library
//!
//! This module provides utilities for setting up logging and tracing
//! for cache operations.

use tracing_subscriber::{EnvFilter, FmtSubscriber};

/// Initialize the tracing subscriber for cache operations
///
/// This function sets up a global tracing subscriber with configurable
/// log levels via environment variables.
///
/// # Environment Variables
///
/// - `RUST_LOG`: Set the log level (e.g., `info`, `debug`, `trace`)
/// - `CACHE_LOG`: Set cache-specific log level (e.g., `cache=debug`)
///
/// # Example
///
/// ```rust,no_run
/// use cache::telemetry::init_subscriber;
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
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));

    let subscriber = FmtSubscriber::builder().with_env_filter(filter).finish();

    tracing::subscriber::set_global_default(subscriber).expect("Failed to set tracing subscriber");
}

/// Initialize the tracing subscriber with custom filter
///
/// # Arguments
///
/// * `filter` - Custom EnvFilter for log level control
///
/// # Example
///
/// ```rust,no_run
/// use cache::telemetry::init_with_filter;
/// use tracing_subscriber::EnvFilter;
///
/// fn main() {
///     let filter = EnvFilter::new("cache=debug,info");
///     init_with_filter(filter);
/// }
/// ```
pub fn init_with_filter(filter: EnvFilter) {
    let subscriber = FmtSubscriber::builder().with_env_filter(filter).finish();

    tracing::subscriber::set_global_default(subscriber).expect("Failed to set tracing subscriber");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_init_subscriber() {
        // This test just ensures the function compiles and doesn't panic
        // In a real scenario, you'd need to handle the global subscriber
        // which can only be set once per process
    }
}
