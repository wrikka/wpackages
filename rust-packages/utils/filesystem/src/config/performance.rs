//! Performance configuration.
//!
//! This module contains configuration for performance settings.

use serde::{Deserialize, Serialize};

use crate::constants::DEFAULT_BUFFER_SIZE;

/// Performance configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceConfig {
    /// Number of worker threads (0 = auto).
    #[serde(default)]
    pub workers: usize,

    /// Buffer size for I/O operations.
    #[serde(default = "default_buffer_size")]
    pub buffer_size: usize,
}

impl Default for PerformanceConfig {
    fn default() -> Self {
        Self {
            workers: 0,
            buffer_size: default_buffer_size(),
        }
    }
}

/// Default buffer size.
#[must_use]
fn default_buffer_size() -> usize {
    DEFAULT_BUFFER_SIZE
}
