//! Telemetry and logging setup for the evaluation framework

use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};
use std::io;

/// Initialize tracing subscriber with configuration
pub fn init_telemetry(
    level: &str,
    structured: bool,
    file_path: Option<&std::path::Path>,
    console_output: bool,
) -> io::Result<()> {
    let env_filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new(level));

    let fmt_layer = tracing_subscriber::fmt::layer()
        .with_target(false)
        .with_thread_ids(true)
        .with_thread_names(true);

    let fmt_layer = if structured {
        fmt_layer.json().boxed()
    } else {
        fmt_layer.pretty().boxed()
    };

    let subscriber = tracing_subscriber::registry()
        .with(env_filter);

    let subscriber = if console_output {
        subscriber.with(fmt_layer.clone())
    } else {
        subscriber
    };

    if let Some(file_path) = file_path {
        let file = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(file_path)?;

        let file_layer = tracing_subscriber::fmt::layer()
            .with_writer(file)
            .with_ansi(false)
            .boxed();

        subscriber.with(file_layer).init();
    } else {
        subscriber.init();
    }

    Ok(())
}

/// Initialize telemetry with default settings
pub fn init_default_telemetry() -> io::Result<()> {
    init_telemetry("info", false, None, true)
}

/// Create a new span for evaluation operations
#[macro_export]
macro_rules! eval_span {
    ($name:expr, $($field:tt)*) => {
        tracing::span!(tracing::Level::INFO, $name, $($field)*)
    };
}

/// Log evaluation start
#[macro_export]
macro_rules! log_eval_start {
    ($eval_id:expr, $name:expr) => {
        tracing::info!(
            eval_id = %$eval_id,
            name = %$name,
            "Starting evaluation"
        );
    };
}

/// Log evaluation completion
#[macro_export]
macro_rules! log_eval_complete {
    ($eval_id:expr, $duration_ms:expr, $samples:expr, $passed:expr) => {
        tracing::info!(
            eval_id = %$eval_id,
            duration_ms = $duration_ms,
            total_samples = $samples,
            passed_samples = $passed,
            pass_rate = %($passed as f64 / $samples as f64),
            "Evaluation completed"
        );
    };
}

/// Log evaluation error
#[macro_export]
macro_rules! log_eval_error {
    ($eval_id:expr, $error:expr) => {
        tracing::error!(
            eval_id = %$eval_id,
            error = %$error,
            "Evaluation failed"
        );
    };
}
