use tracing_subscriber::{EnvFilter, FmtSubscriber};

/// Initialize tracing subscriber with environment-aware filtering
///
/// Sets up structured logging with:
/// - Environment variable support (RUST_LOG)
/// - Thread IDs for debugging
/// - File and line number tracking
pub fn init_subscriber() {
    let filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("info"));

    let subscriber = FmtSubscriber::builder()
        .with_env_filter(filter)
        .with_target(false)
        .with_thread_ids(true)
        .with_file(true)
        .with_line_number(true)
        .finish();

    tracing::subscriber::set_global_default(subscriber)
        .expect("Failed to set tracing subscriber");
}
