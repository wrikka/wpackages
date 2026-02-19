//! The `file-ops` prelude.
//!
//! This module re-exports commonly used types and traits for convenience.
//! Use `use file_ops::prelude::*` to bring these items into scope.

// Core error types
pub use crate::error::{Error, Result};

// Configuration
pub use crate::config::Config;

// Core operations (re-exported from appropriate modules)
pub use crate::core_ops::{CopyOptions, MoveOptions};

// Path utilities
pub use camino::{Utf8Path, Utf8PathBuf};

// Async runtime (when needed)
pub use tokio;

// Serialization
pub use serde::{Deserialize, Serialize};

// Tracing
pub use tracing::{debug, error, info, trace, warn};
