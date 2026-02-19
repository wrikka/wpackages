//! # Observability & Logging
//!
//! Telemetry and logging setup using `tracing`.
//!
//! This module initializes the global tracing subscriber with:
//! - Environment-based log level filtering
//! - Structured logging output
//! - Support for distributed tracing
//!
//! # Usage
//!
//! Initialize at application start:
//!
//! ```no_run
//! use ai_tui::telemetry;
//!
//! fn main() {
//!     telemetry::init_subscriber();
//!     // ... application code ...
//! }
//! ```
//!
//! # Environment Variables
//!
//! Set `RUST_LOG` to control log level:
//! - `RUST_LOG=trace` - Most verbose
//! - `RUST_LOG=debug` - Debug information
//! - `RUST_LOG=info` - Informational (default)
//! - `RUST_LOG=warn` - Warnings only
//! - `RUST_LOG=error` - Errors only

use tracing_subscriber::{EnvFilter, FmtSubscriber};

/// Initialize the global tracing subscriber
///
/// This sets up structured logging with environment-based filtering.
/// Logs at `info` level by default, but can be overridden via `RUST_LOG`.
pub fn init_subscriber() {
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));

    let subscriber = FmtSubscriber::builder().with_env_filter(filter).finish();

    tracing::subscriber::set_global_default(subscriber).expect("Failed to set tracing subscriber");
}
