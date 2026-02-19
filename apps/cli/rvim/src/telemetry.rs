//! Telemetry and logging setup for RVim
//!
//! This module provides centralized logging configuration using the tracing crate.

use tracing_subscriber::{EnvFilter, FmtSubscriber};

/// Initialize the global tracing subscriber
///
/// This sets up structured logging with environment-based filtering.
/// The log level can be controlled via the `RUST_LOG` environment variable.
/// If not set, defaults to "info" level.
pub fn init_subscriber() {
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));

    let subscriber = FmtSubscriber::builder()
        .with_env_filter(filter)
        .with_target(false)
        .with_thread_ids(false)
        .with_file(false)
        .with_line_number(false)
        .finish();

    tracing::subscriber::set_global_default(subscriber).expect("Failed to set tracing subscriber");
}
