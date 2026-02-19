//! Search configuration.
//!
//! This module contains configuration for search operations.

use serde::{Deserialize, Serialize};

use super::constants::{
    DEFAULT_MAX_RESULTS, DEFAULT_FILE_TYPES,
};
use super::utils::default_true;

/// Search configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchConfig {
    /// Enable search functionality.
    #[serde(default = "default_true")]
    pub enabled: bool,

    /// Ignore hidden files in search.
    #[serde(default)]
    pub ignore_hidden: bool,

    /// Follow symbolic links in search.
    #[serde(default)]
    pub follow_symlinks: bool,

    /// Maximum search results.
    #[serde(default = "default_max_results")]
    pub max_results: usize,

    /// Case sensitive search.
    #[serde(default)]
    pub case_sensitive: bool,

    /// File types to include in search.
    #[serde(default = "default_file_types")]
    pub file_types: Vec<String>,
}

impl Default for SearchConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            ignore_hidden: true,
            follow_symlinks: false,
            max_results: default_max_results(),
            case_sensitive: false,
            file_types: default_file_types(),
        }
    }
}

/// Default maximum search results.
#[must_use]
fn default_max_results() -> usize {
    DEFAULT_MAX_RESULTS
}

/// Default file types.
#[must_use]
fn default_file_types() -> Vec<String> {
    vec![String::from(DEFAULT_FILE_TYPES)]
}

