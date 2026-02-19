//! Watcher configuration.
//!
//! This module contains configuration for file watching.

use serde::{Deserialize, Serialize};

use super::constants::DEFAULT_DEBOUNCE_MS;
use super::utils::default_true;

/// Watcher configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WatcherConfig {
    /// Enable file watching.
    #[serde(default = "default_true")]
    pub enabled: bool,

    /// Debounce delay in milliseconds.
    #[serde(default = "default_debounce_ms")]
    pub debounce_ms: u64,
}

impl Default for WatcherConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            debounce_ms: default_debounce_ms(),
        }
    }
}

/// Default debounce delay.
#[must_use]
fn default_debounce_ms() -> u64 {
    DEFAULT_DEBOUNCE_MS
}

