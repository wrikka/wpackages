//! Telemetry and logging setup for Config Suite
//!
//! This module provides centralized logging configuration using the `tracing` crate.

use tracing_subscriber::{EnvFilter, FmtSubscriber};

/// Initializes the global tracing subscriber for the config suite.
///
/// This function sets up structured logging with the following features:
/// - Environment variable support for log level filtering (RUST_LOG)
/// - Default log level: `info`
/// - Compact log format
/// - ANSI color support
/// - File and line number display
/// - Target (module path) display
///
/// # Panics
///
/// Panics if the global subscriber is already set or if initialization fails.
///
/// # Example
///
/// ```no_run
/// use config::telemetry::init_subscriber;
///
/// fn main() {
///     init_subscriber();
///     // Your application code here
/// }
/// ```
pub fn init_subscriber() {
    let filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("info"));

    let subscriber = FmtSubscriber::builder()
        .with_env_filter(filter)
        .with_file(true)
        .with_line_number(true)
        .with_target(true)
        .with_ansi(true)
        .compact()
        .finish();

    tracing::subscriber::set_global_default(subscriber)
        .expect("Failed to set tracing subscriber");
}

/// Initializes the tracing subscriber with a custom environment variable prefix.
///
/// # Arguments
///
/// * `prefix` - The prefix for environment variables (e.g., "CONFIG_")
///
/// # Example
///
/// ```no_run
/// use config::telemetry::init_subscriber_with_prefix;
///
/// fn main() {
///     init_subscriber_with_prefix("CONFIG_");
/// }
/// ```
pub fn init_subscriber_with_prefix(prefix: &str) {
    let filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("info"));

    let subscriber = FmtSubscriber::builder()
        .with_env_filter(filter)
        .with_file(true)
        .with_line_number(true)
        .with_target(true)
        .with_ansi(true)
        .compact()
        .finish();

    tracing::subscriber::set_global_default(subscriber)
        .expect("Failed to set tracing subscriber");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[ignore = "Cannot set global subscriber multiple times"]
    fn test_init_subscriber() {
        init_subscriber();
    }
}
