//! # File Ops
//!
//! A comprehensive, safe, and fast file operations library for Rust.
//!
//! `file-ops` provides a high-level API for common file system tasks,
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
//! use file_ops::prelude::*;
//! use file_ops::core_ops::{copy, CopyOptions};
//! use camino::Utf8Path;
//!
//! # fn main() -> file_ops::Result<()> {
//! let src = Utf8Path::new("source.txt");
//! let dst = Utf8Path::new("dest.txt");
//! copy(src, dst, &CopyOptions::default())?;
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

// Public API modules
pub mod core_ops;
pub mod atomic;
pub mod batch;
pub mod checksum;
pub mod compression;
pub mod encryption;
pub mod metadata;
pub mod path;
pub mod sync;
pub mod transaction;
pub mod temp;
pub mod locking;
pub mod permissions;
pub mod search;
pub mod watcher;
pub mod stream;
pub mod progress;
pub mod asynchronous;
pub mod links;
pub mod patch;
pub mod mime;
pub mod tail;

// Feature-gated modules
#[cfg(feature = "cloud")]
pub mod cloud;

#[cfg(feature = "serde")]
pub mod serde_helpers;

// Re-exports for convenient access
pub use error::{Error, Result};
pub use config::Config;
pub use prelude::*;

// Core operations re-exports
pub use core_ops::{copy, delete, move_file, CopyOptions, MoveOptions};
pub use atomic::atomic_write;
pub use batch::{copy_batch, copy_batch_glob};
pub use checksum::{checksum, sha256, blake3, ChecksumAlgorithm};
pub use compression::{
    compress_gzip, compress_zstd, compress_bzip2,
    decompress_gzip, decompress_zstd, decompress_bzip2,
    CompressionOptions, CompressionLevel,
};
pub use encryption::{encrypt, decrypt};
pub use metadata::{get_metadata, set_metadata, Metadata};
pub use path::clean_path;
pub use progress::{Progress, ProgressCallback};
pub use sync::{synchronize, SyncOptions};
pub use transaction::Transaction;
pub use temp::{TempFile, TempDir};
pub use locking::FileLock;
pub use permissions::PermissionsBuilder;
pub use search::find_files_with_content;
pub use watcher::watch;
pub use stream::stream_data;

// Version information
pub const VERSION: &str = env!("CARGO_PKG_VERSION");















