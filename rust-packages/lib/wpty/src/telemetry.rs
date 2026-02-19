use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

/// Initialize the telemetry (logging/tracing) system
pub fn init_telemetry() {
    let filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("info"));

    let fmt_layer = fmt::layer()
        .with_target(true)
        .with_thread_ids(true)
        .with_thread_names(true);

    tracing_subscriber::registry()
        .with(filter)
        .with(fmt_layer)
        .init();
}

/// Initialize telemetry with a specific log level
pub fn init_telemetry_with_level(level: &str) {
    let filter = EnvFilter::new(level);

    let fmt_layer = fmt::layer()
        .with_target(true)
        .with_thread_ids(true)
        .with_thread_names(true);

    tracing_subscriber::registry()
        .with(filter)
        .with(fmt_layer)
        .init();
}

/// Initialize telemetry for tests (quiet mode)
#[cfg(test)]
pub fn init_test_telemetry() {
    let _ = tracing_subscriber::fmt()
        .with_env_filter("error")
        .try_init();
}
