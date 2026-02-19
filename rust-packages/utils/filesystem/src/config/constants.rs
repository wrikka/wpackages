//! Configuration constants.
//!
//! This module contains constants used throughout the configuration system.

/// Default configuration filename.
pub const DEFAULT_CONFIG_FILENAME: &str = "Config.toml";

/// Environment variable prefix for configuration.
pub const ENV_PREFIX: &str = "FILESYSTEM";

/// Default application name.
pub const DEFAULT_APP_NAME: &str = "filesystem";

/// Default application description.
pub const DEFAULT_APP_DESCRIPTION: &str = "Filesystem utilities for wai";

/// Default log format.
pub const DEFAULT_LOG_FORMAT: &str = "compact";

/// Default log level.
pub const DEFAULT_LOG_LEVEL: &str = "info";

/// Default maximum navigation depth.
pub const DEFAULT_MAX_DEPTH: usize = 100;

/// Default maximum search results.
pub const DEFAULT_MAX_RESULTS: usize = 1000;

/// Default maximum parallel operations.
pub const DEFAULT_MAX_PARALLEL_OPS: usize = 10;

/// Default retry attempts.
pub const DEFAULT_RETRY_ATTEMPTS: usize = 3;

/// Default debounce delay in milliseconds.
pub const DEFAULT_DEBOUNCE_MS: u64 = 300;

/// Default file types for search.
pub const DEFAULT_FILE_TYPES: &str = "*";
