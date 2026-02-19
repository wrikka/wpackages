//! Prelude module for convenient imports
//!
//! Import this module to get all essential types and traits:
//!
//! ```rust,no_run
//! use telemetry::prelude::*;
//! ```

pub use crate::config::TelemetryConfig;
pub use crate::error::TelemetryError;
pub use crate::init::init_telemetry;
