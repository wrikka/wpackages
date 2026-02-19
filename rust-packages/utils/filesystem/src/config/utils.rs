//! Configuration utilities.
//!
//! This module contains shared utilities for configuration.

/// Default true value for serde defaults.
#[must_use]
pub const fn default_true() -> bool {
    true
}

/// Default false value for serde defaults.
#[must_use]
pub const fn default_false() -> bool {
    false
}
