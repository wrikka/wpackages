// Prelude module for common imports
// This module re-exports commonly used types and traits to reduce import boilerplate

pub use crate::error::{Error, Result};
pub use crate::types::*;

// Re-export common std types
pub use std::collections::HashMap;
pub use std::sync::Arc;

// Re-export common external crate types
pub use serde::{Deserialize, Serialize};

// Re-export tokio types
pub use tokio::sync::{Mutex, RwLock};

// Re-export chrono types
pub use chrono::{DateTime, Utc};

// Re-export uuid types
pub use uuid::Uuid;
