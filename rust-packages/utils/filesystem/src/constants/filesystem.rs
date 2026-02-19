//! General filesystem constants.
//!
//! This module contains constants used throughout the filesystem utilities
//! that are not configuration-specific.

/// Default buffer size for file operations.
pub const DEFAULT_BUFFER_SIZE: usize = 8192;

/// Maximum path length for Windows compatibility.
pub const MAX_PATH_LENGTH: usize = 260;

/// Default file permissions (0o644 = rw-r--r--).
pub const DEFAULT_FILE_PERMISSIONS: u32 = 0o644;

/// Default directory permissions (0o755 = rwxr-xr-x).
pub const DEFAULT_DIR_PERMISSIONS: u32 = 0o755;

/// Block size for file system operations.
pub const BLOCK_SIZE: usize = 4096;

/// Maximum number of symbolic links to follow.
pub const MAX_SYMLINK_FOLLOW: usize = 40;
