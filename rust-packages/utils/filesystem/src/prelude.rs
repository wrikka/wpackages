//! The `filesystem` prelude.
//!
//! This module re-exports commonly used types and traits for convenience.
//! Use `use filesystem::prelude::*` to bring these items into scope.

// Core error types
pub use crate::error::{FsError, FsResult};

// Configuration
pub use crate::config::FilesystemConfig;

// Core types
pub use crate::types::{FileKind, FileNode};

// Core components
pub use crate::components::{AbsPath, RepoRoot};

// Path utilities
pub use camino::{Utf8Path, Utf8PathBuf};

// Async runtime
pub use tokio;

// Serialization
pub use serde::{Deserialize, Serialize};

// Tracing
pub use tracing::{debug, error, info, trace, warn};

// Utility functions
pub use crate::utils::file_name_from_path;
