//! # Cache Library
//!
//! A generic, high-performance caching library for Rust applications with multiple storage backends.
//!
//! ## Features
//!
//! - **Generic Interface**: `Cache<K, V>` trait for any key/value types
//! - **Multiple Backends**: In-memory (Moka) and persistent (Sled) storage
//! - **Flexible Configuration**: TTL, capacity limits, eviction policies
//! - **Metrics**: Built-in hit rate, miss rate, and utilization tracking
//! - **Async Operations**: Non-blocking get/set operations
//!
//! ## Quick Start
//!
//! ```rust,no_run
//! use cache::prelude::*;
//!
//! #[tokio::main]
//! async fn main() -> Result<(), CacheError> {
//!     // Create an in-memory cache
//!     let config = CacheConfig::builder()
//!         .max_capacity(1000)
//!         .ttl(std::time::Duration::from_secs(3600))
//!         .build();
//!
//!     let cache = InMemoryCache::new(&config);
//!
//!     // Set a value
//!     cache.set("key".to_string(), "value".to_string()).await?;
//!
//!     // Get a value
//!     if let Some(value) = cache.get(&"key".to_string()).await? {
//!         println!("Found: {}", value);
//!     }
//!
//!     Ok(())
//! }
//! ```
//!
//! ## Modules
//!
//! - [`traits`] - Core cache trait definitions
//! - [`config`] - Cache configuration and builders
//! - [`metrics`] - Cache metrics and monitoring
//! - [`strategies`] - Eviction strategies (LRU, LFU)
//! - [`utils`] - Cache key generation helpers
//! - [`in_memory`] - In-memory cache implementation
//! - [`disk`] - Persistent disk cache implementation
//! - [`error`] - Error types and result aliases
//!
//! ## Storage Backends
//!
//! ### In-Memory Cache
//!
//! Fast, volatile storage using Moka. Best for:
//! - Hot data caching
//! - Session data
//! - Temporary computations
//!
//! ### Disk Cache
//!
//! Persistent storage using Sled. Best for:
//! - Large datasets
//! - Long-term caching
//! - Data persistence across restarts
//!
//! ## Configuration
//!
//! Use [`CacheConfig`] builder to configure cache behavior:
//!
//! ```rust,no_run
//! use cache::prelude::*;
//! use std::time::Duration;
//!
//! let config = CacheConfig::builder()
//!     .backend(CacheBackendType::InMemory)
//!     .max_capacity(10000)
//!     .ttl(Duration::from_secs(3600))
//!     .ttl_idle(Duration::from_secs(300))
//!     .eviction_policy(EvictionPolicy::Lru)
//!     .enable_metrics(true)
//!     .namespace("my_app".to_string())
//!     .build();
//! ```
//!
//! ## Metrics
//!
//! Track cache performance with built-in metrics:
//!
//! ```rust,no_run
//! use cache::prelude::*;
//!
//! let cache = InMemoryCache::new(&CacheConfig::default());
//! // ... use cache ...
//!
//! let metrics = cache.metrics();
//! println!("Hit rate: {:.2}%", metrics.hit_rate() * 100.0);
//! println!("Miss rate: {:.2}%", metrics.miss_rate() * 100.0);
//! println!("Utilization: {:.2}%", metrics.utilization() * 100.0);
//! ```

pub mod adapters;
pub mod components;
pub mod config;
pub mod constants;
pub mod error;
pub mod services;
pub mod types;
pub mod utils;

#[cfg(feature = "telemetry")]
pub mod telemetry;

pub use components::EvictionStrategy;
pub use config::{CacheBackendType, CacheConfig, EvictionPolicy};
pub use error::{CacheError, CacheResult};
pub use types::{Cache, CacheBackend};
pub use utils::generate_cache_key;
pub use utils::CacheMetrics;

#[cfg(feature = "in-memory")]
pub use services::InMemoryCache;

#[cfg(feature = "disk")]
pub use services::DiskCache;

#[cfg(feature = "redis")]
pub use services::RedisCache;

#[cfg(all(feature = "in-memory", feature = "disk"))]
pub use services::LayeredCache;

pub mod prelude {
    //! Prelude module for convenient imports
    //!
    //! Import this module to get all essential types and traits:
    //!
    //! ```rust,no_run
    //! use cache::prelude::*;
    //! ```

    pub use crate::config::CacheConfig;
    pub use crate::error::{CacheError, CacheResult};
    pub use crate::types::Cache;
    pub use crate::utils::generate_cache_key;
    pub use crate::utils::CacheMetrics;

    #[cfg(feature = "in-memory")]
    pub use crate::services::InMemoryCache;

    #[cfg(feature = "disk")]
    pub use crate::services::DiskCache;

    #[cfg(feature = "redis")]
    pub use crate::services::RedisCache;

    #[cfg(all(feature = "in-memory", feature = "disk"))]
    pub use crate::services::LayeredCache;

    #[cfg(feature = "telemetry")]
    pub use crate::telemetry::init_subscriber;
}
