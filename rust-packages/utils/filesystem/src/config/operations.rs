//! Operations configuration.
//!
//! This module contains configuration for filesystem operations.

use serde::{Deserialize, Serialize};

use super::constants::{
    DEFAULT_MAX_PARALLEL_OPS, DEFAULT_RETRY_ATTEMPTS,
};
use super::utils::default_true;

/// Maximum number of parallel operations allowed.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub struct MaxParallelOps(usize);

/// Number of retry attempts for failed operations.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub struct RetryAttempts(usize);

impl MaxParallelOps {
    /// Create a new MaxParallelOps value.
    #[must_use]
    pub fn new(value: usize) -> Self {
        Self(value)
    }

    /// Get the inner value.
    #[must_use]
    pub fn value(self) -> usize {
        self.0
    }
}

impl RetryAttempts {
    /// Create a new RetryAttempts value.
    #[must_use]
    pub fn new(value: usize) -> Self {
        Self(value)
    }

    /// Get the inner value.
    #[must_use]
    pub fn value(self) -> usize {
        self.0
    }
}

/// Operations configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OperationsConfig {
    /// Maximum parallel operations.
    #[serde(default = "default_max_parallel_ops")]
    pub max_parallel_ops: MaxParallelOps,

    /// Number of retry attempts.
    #[serde(default = "default_retry_attempts")]
    pub retry_attempts: RetryAttempts,

    /// Enable atomic writes.
    #[serde(default = "default_true")]
    pub atomic_writes: bool,

    /// Preserve file permissions.
    #[serde(default = "default_true")]
    pub preserve_permissions: bool,

    /// Preserve file timestamps.
    #[serde(default = "default_true")]
    pub preserve_timestamps: bool,
}

impl Default for OperationsConfig {
    fn default() -> Self {
        Self {
            max_parallel_ops: default_max_parallel_ops(),
            retry_attempts: default_retry_attempts(),
            atomic_writes: true,
            preserve_permissions: true,
            preserve_timestamps: true,
        }
    }
}

/// Default maximum parallel operations.
#[must_use]
fn default_max_parallel_ops() -> MaxParallelOps {
    MaxParallelOps::new(DEFAULT_MAX_PARALLEL_OPS)
}

/// Default retry attempts.
#[must_use]
fn default_retry_attempts() -> RetryAttempts {
    RetryAttempts::new(DEFAULT_RETRY_ATTEMPTS)
}

