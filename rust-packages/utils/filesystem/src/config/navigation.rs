//! Navigation configuration.
//!
//! This module contains configuration for navigation operations.

use serde::{Deserialize, Serialize};

use super::constants::{
    DEFAULT_MAX_DEPTH,
};
use super::utils::default_true;

/// Navigation configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NavigationConfig {
    /// Maximum navigation depth.
    #[serde(default = "default_max_depth")]
    pub max_depth: usize,

    /// Show hidden files.
    #[serde(default)]
    pub show_hidden: bool,

    /// Follow symbolic links.
    #[serde(default = "default_true")]
    pub follow_symlinks: bool,
}

impl Default for NavigationConfig {
    fn default() -> Self {
        Self {
            max_depth: default_max_depth(),
            show_hidden: false,
            follow_symlinks: true,
        }
    }
}

/// Default maximum navigation depth.
#[must_use]
fn default_max_depth() -> usize {
    DEFAULT_MAX_DEPTH
}

