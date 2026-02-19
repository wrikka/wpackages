//! Telemetry and Logging Setup
//!
//! Initializes tracing subscriber for structured logging and observability.

use tracing_subscriber::{EnvFilter, FmtSubscriber};

/// Initialize the tracing subscriber with environment-based log level filtering.
///
/// This function sets up the global tracing subscriber with:
/// - Environment variable based log level filtering (RUST_LOG)
/// - Default to `info` level if no environment variable is set
/// - Pretty-printed output with timestamps and module paths
pub fn init_subscriber() {
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));

    let subscriber = FmtSubscriber::builder()
        .with_env_filter(filter)
        .with_target(true)
        .with_thread_ids(true)
        .with_line_number(true)
        .finish();

    tracing::subscriber::set_global_default(subscriber).expect("Failed to set tracing subscriber");
}
