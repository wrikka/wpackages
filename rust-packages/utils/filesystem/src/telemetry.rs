//! Telemetry and logging setup for `filesystem`.
//!
//! This module provides centralized logging configuration and initialization
//! using `tracing` and `tracing-subscriber` for structured logging.

use crate::config::FilesystemConfig;
use crate::error::{FsError, FsResult};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter, Registry};
use tracing_subscriber::fmt::{self, format::FmtSpan};

/// Initialize default telemetry with standard configuration.
pub fn init_default_telemetry() -> FsResult<()> {
    let subscriber = Registry::default()
        .with(
            fmt::layer()
                .with_span_events(FmtSpan::CLOSE)
                .with_target(true)
                .with_thread_ids(true)
                .with_thread_names(true)
                .with_file(true)
                .with_line_number(true)
        )
        .with(EnvFilter::from_default_env()
            .add_directive("filesystem=debug".parse().unwrap())
            .add_directive("tokio=info".parse().unwrap())
            .add_directive("notify=warn".parse().unwrap())
        );

    subscriber.init();
    Ok(())
}

/// Initialize telemetry with custom configuration.
pub fn init_telemetry(config: &FilesystemConfig) -> FsResult<()> {
    let log_level = &config.logging.level;
    let log_format = &config.logging.format;

    let fmt_layer = match log_format.as_str() {
        "pretty" => fmt::layer()
            .with_span_events(FmtSpan::CLOSE)
            .with_target(true)
            .with_thread_ids(true)
            .with_thread_names(true)
            .with_file(true)
            .with_line_number(true)
            .pretty(),
        "compact" => fmt::layer()
            .with_target(false)
            .with_thread_ids(false)
            .with_thread_names(false)
            .with_file(false)
            .with_line_number(false)
            .compact(),
        "json" => fmt::layer()
            .with_span_events(FmtSpan::CLOSE)
            .with_target(true)
            .with_thread_ids(true)
            .with_thread_names(true)
            .with_file(true)
            .with_line_number(true)
            .json(),
        _ => fmt::layer()
            .with_span_events(FmtSpan::CLOSE)
            .with_target(true)
            .with_thread_ids(true)
            .with_thread_names(true)
            .with_file(true)
            .with_line_number(true)
            .compact(),
    };

    let mut filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("info"));

    // Add configuration-based directives
    for target in &config.logging.targets {
        let directive = format!("{}={}", target, log_level);
        if let Ok(dir) = directive.parse() {
            filter = filter.add_directive(dir);
        }
    }

    let subscriber = Registry::default()
        .with(fmt_layer)
        .with(filter);

    subscriber.init();

    tracing::info!(
        "Telemetry initialized with level: {}, format: {}",
        log_level,
        log_format
    );

    Ok(())
}

/// Initialize telemetry for testing.
pub fn init_test_telemetry() -> FsResult<()> {
    let subscriber = Registry::default()
        .with(
            fmt::layer()
                .with_span_events(FmtSpan::CLOSE)
                .with_target(true)
                .with_thread_ids(false)
                .with_thread_names(false)
                .with_file(true)
                .with_line_number(true)
                .compact()
        )
        .with(EnvFilter::from_default_env()
            .add_directive("filesystem=trace".parse().unwrap())
            .add_directive("tokio=debug".parse().unwrap())
        );

    subscriber.init();
    Ok(())
}

/// Create a span for filesystem operations.
#[macro_export]
macro_rules! fs_span {
    ($name:expr, $($field:tt)*) => {
        tracing::span!(
            target: "filesystem",
            level: tracing::Level::DEBUG,
            $name,
            $($field)*
        )
    };
}

/// Create a debug trace for filesystem operations.
#[macro_export]
macro_rules! fs_debug {
    ($($arg:tt)*) => {
        tracing::debug!(
            target: "filesystem",
            $($arg)*
        )
    };
}

/// Create an info trace for filesystem operations.
#[macro_export]
macro_rules! fs_info {
    ($($arg:tt)*) => {
        tracing::info!(
            target: "filesystem",
            $($arg)*
        )
    };
}

/// Create a warn trace for filesystem operations.
#[macro_export]
macro_rules! fs_warn {
    ($($arg:tt)*) => {
        tracing::warn!(
            target: "filesystem",
            $($arg)*
        )
    };
}

/// Create an error trace for filesystem operations.
#[macro_export]
macro_rules! fs_error {
    ($($arg:tt)*) => {
        tracing::error!(
            target: "filesystem",
            $($arg)*
        )
    };
}

/// Log the start of a filesystem operation.
#[macro_export]
macro_rules! fs_op_start {
    ($op:expr, $path:expr) => {
        fs_debug!(operation = $op, path = %$path, "Starting operation");
    };
}

/// Log the completion of a filesystem operation.
#[macro_export]
macro_rules! fs_op_complete {
    ($op:expr, $path:expr, duration_ms:expr) => {
        fs_debug!(
            operation = $op,
            path = %$path,
            duration_ms = $duration_ms,
            "Operation completed"
        );
    };
}

/// Log an error in a filesystem operation.
#[macro_export]
macro_rules! fs_op_error {
    ($op:expr, $path:expr, $error:expr) => {
        fs_error!(
            operation = $op,
            path = %$path,
            error = %$error,
            "Operation failed"
        );
    };
}
