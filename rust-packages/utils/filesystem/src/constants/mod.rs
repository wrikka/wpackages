//! Constants for filesystem utilities.

pub mod filesystem;

// Re-export commonly used constants
pub use filesystem::{
    DEFAULT_BUFFER_SIZE, MAX_PATH_LENGTH, DEFAULT_FILE_PERMISSIONS,
    DEFAULT_DIR_PERMISSIONS, BLOCK_SIZE, MAX_SYMLINK_FOLLOW
};
