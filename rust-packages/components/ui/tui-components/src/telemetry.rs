//! Telemetry and logging setup using tracing

use tracing_subscriber::{EnvFilter, FmtSubscriber};

/// Initialize the tracing subscriber
///
/// This sets up the global tracing subscriber with:
/// - Environment-based log level filtering
/// - Default log level of `info` if not specified
/// - Pretty console output
pub fn init_subscriber() {
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));

    let subscriber = FmtSubscriber::builder().with_env_filter(filter).finish();

    tracing::subscriber::set_global_default(subscriber).expect("Failed to set tracing subscriber");
}

/// Initialize subscriber with custom filter
pub fn init_subscriber_with_filter(filter: &str) {
    let env_filter = EnvFilter::try_new(filter).unwrap_or_else(|_| EnvFilter::new("info"));

    let subscriber = FmtSubscriber::builder()
        .with_env_filter(env_filter)
        .finish();

    tracing::subscriber::set_global_default(subscriber).expect("Failed to set tracing subscriber");
}
