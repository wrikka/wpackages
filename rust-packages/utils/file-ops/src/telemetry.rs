//! Telemetry (logging and tracing) setup for `file-ops`.
//!
//! This module provides centralized logging configuration using `tracing`,
//! with support for multiple output formats and environment-based filtering.

use std::io;
use tracing::Level;
use tracing_subscriber::{
    fmt::format::FmtSpan,
    layer::SubscriberExt,
    util::SubscriberInitExt,
    EnvFilter, Layer,
};

use crate::config::LogConfig;
use crate::error::Result;

/// Initialize the global tracing subscriber.
///
/// This function sets up logging based on the provided configuration.
/// It should be called once at application startup.
///
/// # Errors
///
/// Returns an error if the tracing subscriber cannot be initialized.
pub fn init(config: &LogConfig) -> Result<()> {
    let filter = create_filter(&config.level);
    let fmt_layer = create_fmt_layer(config);

    tracing_subscriber::registry()
        .with(filter)
        .with(fmt_layer)
        .try_init()
        .map_err(|_| crate::error::Error::validation("Failed to initialize tracing subscriber"))?;

    Ok(())
}

/// Initialize telemetry with default settings.
///
/// This is a convenience function for quick setup during development
/// or when configuration is not available.
pub fn init_default() -> Result<()> {
    let config = LogConfig::default();
    init(&config)
}

/// Create an environment filter from a log level string.
#[must_use]
fn create_filter(level: &str) -> EnvFilter {
    let directive = format!("file_ops={level}");

    EnvFilter::builder()
        .with_default_directive(Level::INFO.into())
        .parse_lossy(directive)
}

/// Create a formatting layer based on configuration.
#[must_use]
fn create_fmt_layer<S>(config: &LogConfig) -> Box<dyn Layer<S> + Send + Sync>
where
    S: tracing::Subscriber + for<'a> tracing_subscriber::registry::LookupSpan<'a>,
{
    let fmt = tracing_subscriber::fmt::layer()
        .with_span_events(FmtSpan::CLOSE)
        .with_target(true)
        .with_thread_ids(false)
        .with_thread_names(false)
        .with_ansi(config.colored);

    match config.format.as_str() {
        "pretty" => fmt.pretty().boxed(),
        _ => fmt.compact().boxed(),
    }
}

/// Create a span for tracking file operations.
///
/// This helper creates a tracing span with standardized metadata
/// for file system operations.
#[macro_export]
macro_rules! file_op_span {
    ($op:expr, $path:expr) => {
        tracing::info_span!(
            "file_op",
            operation = $op,
            path = %$path,
        )
    };
}

/// Log a file operation with standardized metadata.
#[macro_export]
macro_rules! log_file_op {
    ($level:ident, $op:expr, $path:expr, $($arg:tt)*) => {
        tracing::$level!(
            operation = $op,
            path = %$path,
            $($arg)*
        )
    };
}

/// Telemetry guard for temporary logging setup.
///
/// This struct ensures proper cleanup of telemetry resources
/// when it goes out of scope.
pub struct TelemetryGuard;

impl TelemetryGuard {
    /// Create a new telemetry guard with the given configuration.
    ///
    /// # Errors
    ///
    /// Returns an error if telemetry initialization fails.
    pub fn new(config: &LogConfig) -> Result<Self> {
        init(config)?;
        Ok(Self)
    }
}

impl Drop for TelemetryGuard {
    fn drop(&mut self) {
        tracing::debug!("Telemetry guard dropped, flushing logs");
    }
}
