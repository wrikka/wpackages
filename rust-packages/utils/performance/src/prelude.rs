//! Prelude module for common imports

pub use crate::error::{PerformanceError, Result};
pub use crate::config::PerformanceConfig;

// Re-export commonly used external crates
pub use anyhow::{Context, Result as AnyhowResult};
pub use thiserror::Error;
pub use serde::{Deserialize, Serialize};
pub use tracing::{debug, error, info, instrument, trace, warn, Level};
pub use chrono::{DateTime, Utc};

// Re-export common types
pub use std::collections::HashMap;
pub use std::time::{Duration, Instant};
