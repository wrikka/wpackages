//! Constants
//!
//! This module contains all constant values used throughout the application.

/// Default timeout for API requests in seconds
pub const DEFAULT_TIMEOUT_SECONDS: u64 = 30;

/// Maximum number of retries for failed requests
pub const MAX_RETRIES: u32 = 3;

/// Default cache TTL in seconds
pub const DEFAULT_CACHE_TTL_SECONDS: u64 = 3600;

/// Maximum cache size in MB
pub const MAX_CACHE_SIZE_MB: usize = 100;
