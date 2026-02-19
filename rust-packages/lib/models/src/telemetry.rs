//! Telemetry and logging setup
//!
//! This module initializes tracing and logging infrastructure.

use tracing_subscriber::{EnvFilter, FmtSubscriber};

/// Initialize the tracing subscriber
///
/// This function sets up the global tracing subscriber with:
/// - Environment-based log level filtering
/// - Pretty formatting for human-readable output
/// - Default to "info" level if RUST_LOG is not set
pub fn init_subscriber() {
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));

    let subscriber = FmtSubscriber::builder()
        .with_env_filter(filter)
        .pretty()
        .finish();

    tracing::subscriber::set_global_default(subscriber).expect("Failed to set tracing subscriber");
}

/// Initialize subscriber with custom configuration
pub fn init_subscriber_with_config(level: &str, pretty: bool) {
    let filter = EnvFilter::new(level);

    if pretty {
        let subscriber = FmtSubscriber::builder()
            .with_env_filter(filter)
            .pretty()
            .finish();
        tracing::subscriber::set_global_default(subscriber)
            .expect("Failed to set tracing subscriber");
    } else {
        let subscriber = FmtSubscriber::builder()
            .with_env_filter(filter)
            .compact()
            .finish();
        tracing::subscriber::set_global_default(subscriber)
            .expect("Failed to set tracing subscriber");
    }
}
