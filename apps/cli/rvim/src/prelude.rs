//! Prelude module - Common imports for RVim
//!
//! This module re-exports commonly used types and functions to make imports easier
//! throughout the codebase.

// Error handling
pub use crate::error::{AppError, Result};

// Configuration
pub use crate::config::AppConfig;

// Core types
pub use crate::types::*;

// Components
pub use crate::components::*;

// Services
pub use crate::services::*;

// Re-export common std types
pub use std::collections::{HashMap, HashSet};
pub use std::path::{Path, PathBuf};
pub use std::sync::Arc;

// Re-export common external crates
pub use anyhow::Context;
pub use chrono::{DateTime, Utc};
pub use serde::{Deserialize, Serialize};
pub use tracing::{debug, error, info, instrument, trace, warn};
pub use validator::Validate;
