//! Utilities for `file-ops`.
//!
//! This module contains pure helper functions that have no dependencies
//! on other parts of the crate. These are standalone utilities that can
//! be used anywhere without creating circular dependencies.

/// Stream utilities.
pub mod stream {
    pub use crate::stream::stream_data;
}

/// Progress utilities.
pub mod progress {
    pub use crate::progress::{Progress, ProgressCallback};
}

/// Serialization helpers (when feature enabled).
#[cfg(feature = "serde")]
pub mod serde {
    pub use crate::serde_helpers::{read_json, write_json, read_toml, write_toml};
}
