//! Filesystem types
//!
//! Types for file entries and metadata.

use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// File entry information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileEntry {
    /// File name
    pub name: String,
    /// Full path
    pub path: PathBuf,
    /// Whether this is a directory
    pub is_directory: bool,
    /// File metadata
    pub metadata: Option<FileMetadata>,
}

/// File metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileMetadata {
    /// File size in bytes
    pub size: u64,
}
