//! Prelude module for common imports
//!
//! This module re-exports commonly used types and traits to simplify imports
//! across the application. Use `use tui_components::prelude::*;` to import all.

// Standard library
pub use std::collections::HashMap;
pub use std::sync::Arc;

// Error handling
pub use crate::error::{Result, TuiComponentsError};

// Configuration
pub use crate::config::AppConfig;

// Types
pub use crate::types::{AppMode, ExecutionMode, ExecutionPlan, FocusPanel, PlanStatus};

// Async runtime
pub use tokio::sync::{Mutex, RwLock};

// Serialization
pub use serde::{Deserialize, Serialize};

// Logging
pub use tracing::{debug, error, info, instrument, trace, warn};

// Time
pub use chrono::{DateTime, Utc};
