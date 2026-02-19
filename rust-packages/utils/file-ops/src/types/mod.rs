//! Type definitions for `file-ops`.
//!
//! This module contains all data structures, enums, and type aliases
//! used throughout the crate. Keeping types centralized improves
//! discoverability and maintainability.

// Progress types
pub use crate::progress::{Progress, ProgressCallback};

// Operation options
pub use crate::core_ops::{CopyOptions, MoveOptions};

// Checksum types
pub use crate::checksum::{ChecksumAlgorithm, Sha256, Blake3};

// Compression types
pub use crate::compression::{CompressionOptions, CompressionLevel};

// Sync types
pub use crate::sync::SyncOptions;

// Stream types
pub use crate::stream::stream_data;

// Lock types
pub use crate::locking::FileLock;

// Temp types
pub use crate::temp::{TempFile, TempDir};

// Transaction types
pub use crate::transaction::Transaction;

// Metadata types
pub use crate::metadata::Metadata;

// Cloud types (when feature enabled)
#[cfg(feature = "cloud")]
pub use crate::cloud::CloudStore;
