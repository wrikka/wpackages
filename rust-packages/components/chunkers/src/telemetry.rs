//! Telemetry setup for chunking-strategies

use tracing_subscriber::{EnvFilter, FmtSubscriber};

/// Initialize the global tracing subscriber
pub fn init_subscriber() {
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));

    let subscriber = FmtSubscriber::builder().with_env_filter(filter).finish();

    tracing::subscriber::set_global_default(subscriber).expect("Failed to set tracing subscriber");
}
