//! Prelude module for convenient imports
//!
//! Import this module to get all essential types and traits:
//!
//! ```rust,no_run
//! use cache::prelude::*;
//! ```

// Core types
pub use crate::error::{CacheError, CacheResult};
pub use crate::types::Cache;
pub use crate::config::CacheConfig;
pub use crate::utils::CacheMetrics;
pub use crate::utils::generate_cache_key;

// Cache implementations
#[cfg(feature = "in-memory")]
pub use crate::services::InMemoryCache;

#[cfg(feature = "disk")]
pub use crate::services::DiskCache;

#[cfg(feature = "redis")]
pub use crate::services::RedisCache;

#[cfg(all(feature = "in-memory", feature = "disk"))]
pub use crate::services::LayeredCache;

// Telemetry
#[cfg(feature = "telemetry")]
pub use crate::telemetry::init_subscriber;

// Re-export commonly used traits from external crates
pub use async_trait::async_trait;
pub use serde::{Deserialize, Serialize};
