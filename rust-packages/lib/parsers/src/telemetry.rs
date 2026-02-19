use tracing::{info, warn, error, debug, trace};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

pub fn init_telemetry() {
    let env_filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("info"));

    tracing_subscriber::registry()
        .with(env_filter)
        .with(tracing_subscriber::fmt::layer())
        .init();

    info!("Telemetry initialized");
}

pub fn log_parse_operation(format: &str, input_size: usize, duration_ms: u64) {
    info!(
        format = format,
        input_size = input_size,
        duration_ms = duration_ms,
        "Parse operation completed"
    );
}

pub fn log_cache_hit(key: &str) {
    trace!(cache_key = key, "Cache hit");
}

pub fn log_cache_miss(key: &str) {
    trace!(cache_key = key, "Cache miss");
}

pub fn log_plugin_registered(name: &str) {
    info!(plugin_name = name, "Plugin registered");
}

pub fn log_validation_error(schema_path: &str, errors: &[String]) {
    warn!(
        schema_path = schema_path,
        error_count = errors.len(),
        "Validation failed"
    );
}

pub fn log_streaming_progress(chunk_size: usize, total_processed: usize) {
    debug!(
        chunk_size = chunk_size,
        total_processed = total_processed,
        "Streaming progress"
    );
}

pub fn log_error_with_context(error: &str, context: &str) {
    error!(error = error, context = context, "Operation failed");
}
