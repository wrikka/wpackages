//! Prelude module for common imports
//!
//! This module re-exports commonly used types and traits to simplify imports
//! across the application. Use `use ai_tui::prelude::*;` to import all.

// Standard library
pub use std::collections::HashMap;
pub use std::sync::Arc;

// Error handling
pub use crate::error::{AppError, Result};

// Configuration
pub use crate::config::AppConfig;

// Async runtime
pub use tokio::sync::{Mutex, RwLock};

// Serialization
pub use serde::{Deserialize, Serialize};

// Logging
pub use tracing::{debug, error, info, instrument, trace, warn};

// Time
pub use chrono::{DateTime, Utc};

// AI SDK - Disabled until properly configured
// pub use aisdk;
