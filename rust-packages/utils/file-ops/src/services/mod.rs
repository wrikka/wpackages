//! Services for `file-ops`.
//!
//! This module contains all I/O operations and side effects.
//! Services implement the "effect layer" and:
//! - Perform file system operations
//! - Handle network I/O (cloud storage)
//! - Manage external resources
//! - Use traits for testability

/// File system operations.
pub mod fs {
    pub use crate::core_ops::{copy, move_file, delete, CopyOptions, MoveOptions};
    pub use crate::atomic::atomic_write;
    pub use crate::sync::{synchronize, SyncOptions};
    pub use crate::batch::{copy_batch, copy_batch_glob};
}

/// Asynchronous I/O operations.
pub mod r#async {
    pub use crate::asynchronous::*;
}

/// File watching service.
pub mod watcher {
    pub use crate::watcher::watch;
}

/// Cloud storage service (when feature enabled).
#[cfg(feature = "cloud")]
pub mod cloud {
    pub use crate::cloud::CloudStore;
}

/// File locking service.
pub mod locking {
    pub use crate::locking::FileLock;
}

/// Search operations.
pub mod search {
    pub use crate::search::find_files_with_content;
}

/// Metadata operations.
pub mod metadata {
    pub use crate::metadata::{get_metadata, set_metadata, Metadata};
}

/// Permission operations.
pub mod permissions {
    pub use crate::permissions::PermissionsBuilder;
}

/// Symbolic and hard link operations.
pub mod links {
    pub use crate::links::hard_link;
    #[cfg(unix)]
    pub use crate::links::{symlink_file, symlink_dir};
}

/// Temporary file/directory management.
pub mod temp {
    pub use crate::temp::{TempFile, TempDir};
}

/// Transactional operations.
pub mod transaction {
    pub use crate::transaction::Transaction;
}

/// Tailing files.
pub mod tail {
    pub use crate::tail::Tailer;
}
