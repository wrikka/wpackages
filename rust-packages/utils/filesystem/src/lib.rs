//! # Filesystem
//!
//! A comprehensive filesystem utilities library for wai.
//!
//! `filesystem` provides high-level APIs for filesystem tasks,
//! designed with strict architectural patterns:
//!
//! - **Pure Components**: Domain logic without side effects lives in `components/`
//! - **Effect Layer**: I/O operations are isolated in `services/` behind traits
//! - **Type Safety**: Strong typing with `camino::Utf8Path` for all paths
//! - **Error Handling**: Structured errors with `thiserror` for libraries
//!
//! ## Architecture
//!
//! The crate follows a strict layered architecture:
//!
//! - `types/`: Data structures and domain types
//! - `components/`: Pure functions for domain logic
//! - `services/`: I/O operations and side effects
//! - `adapters/`: External library wrappers
//! - `utils/`: Pure helper functions
//!
//! ## Quick Start
//!
//! ```no_run
//! use filesystem::prelude::*;
//! use camino::Utf8Path;
//!
//! # fn main() -> filesystem::FsResult<()> {
//! let path = Utf8Path::new("example.txt");
//! // Use filesystem operations here
//! # Ok(())
//! # }
//! ```

#![warn(missing_docs)]
#![warn(rust_2018_idioms)]

// Core modules - always available
pub mod error;
pub mod config;
pub mod telemetry;
pub mod prelude;

// New folder structure modules
pub mod components;
pub mod constants;
pub mod services;
pub mod types;
pub mod utils;
pub mod adapters;

// Feature-gated modules
#[cfg(feature = "navigation")]
pub use services::navigation;

#[cfg(feature = "search")]
pub use services::search;

// Application module
pub mod app;

// Core filesystem operations
pub use services::filesystem;

// Re-exports for convenient access
pub use error::{FsError, FsResult};
pub use config::FilesystemConfig;
pub use prelude::*;

// Core component re-exports
pub use components::{AbsPath, RepoRoot};
pub use types::{FileKind, FileNode};
pub use utils::file_name_from_path;

// Async filesystem operations
pub mod async_fs {
    pub use super::services::filesystem::read::*;
    pub use super::services::filesystem::write::*;
}

// Version information
pub const VERSION: &str = env!("CARGO_PKG_VERSION");
