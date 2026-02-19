//! Telemetry and observability for resilience patterns

use tracing::{debug, error, info, warn};
use tracing_subscriber::{fmt, prelude::*, EnvFilter};

/// Initialize telemetry with default configuration
pub fn init_telemetry() {
    let filter = EnvFilter::from_default_env().add_directive(tracing::Level::INFO.into());

    tracing_subscriber::registry()
        .with(filter)
        .with(fmt::layer())
        .init();
}

/// Initialize telemetry with custom log level
pub fn init_telemetry_with_level(level: &str) {
    let filter = EnvFilter::from_default_env()
        .add_directive(level.parse().unwrap_or(tracing::Level::INFO.into()));

    tracing_subscriber::registry()
        .with(filter)
        .with(fmt::layer())
        .init();
}
