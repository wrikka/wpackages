//! Initialization module for the extension system.
//!
//! This module provides functions to initialize telemetry, logging, and metrics.

use crate::telemetry::init_subscriber;
use tracing::info;

/// Initializes the extension system with telemetry and logging.
///
/// This function should be called once at application startup.
///
/// # Example
///
/// ```no_run
/// use extensions::initialization::initialize;
///
/// let _ = initialize();
/// // Rest of the application
/// ```
pub fn initialize() {
    init_subscriber();
    info!("Extension system initialized with logging");

    #[cfg(feature = "metrics")]
    {
        init_metrics();
        info!("Metrics exporter initialized");
    }

    #[cfg(not(feature = "metrics"))]
    {
        info!("Metrics feature not enabled, skipping metrics initialization");
    }
}

/// Initializes only logging without metrics.
///
/// Use this if you want to control metrics initialization separately.
pub fn initialize_logging() {
    init_subscriber();
    info!("Logging initialized");
}

/// Initializes only metrics (requires "metrics" feature).
///
/// Use this if you want to control logging initialization separately.
#[cfg(feature = "metrics")]
pub fn initialize_metrics() {
    init_metrics();
    info!("Metrics exporter initialized");
}

/// Initializes the extension system with custom configuration.
///
/// # Parameters
///
/// * `enable_metrics` - Whether to enable metrics export
/// * `log_level` - Optional custom log level (e.g., "debug", "info", "warn")
///
/// # Example
///
/// ```no_run
/// use extensions::initialization::initialize_with_config;
///
/// let _ = initialize_with_config(true, Some("debug"));
/// ```
pub fn initialize_with_config(enable_metrics: bool, log_level: Option<&str>) {
    if let Some(level) = log_level {
        std::env::set_var("RUST_LOG", level);
    }
    init_subscriber();
    info!(
        "Extension system initialized with logging (level: {:?})",
        log_level
    );

    if enable_metrics {
        #[cfg(feature = "metrics")]
        {
            init_metrics();
            info!("Metrics exporter initialized");
        }

        #[cfg(not(feature = "metrics"))]
        {
            tracing::warn!("Metrics requested but 'metrics' feature is not enabled");
        }
    }
}
