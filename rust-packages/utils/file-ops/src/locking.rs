//! Provides cross-platform file locking.
//!
//! This module uses the `fs2` crate to offer exclusive and shared file locks
//! that are automatically released when the `FileLock` guard is dropped.
//!
//! # Example
//!
//! ```no_run
//! use file_ops::FileLock;
//! use camino::Utf8Path;
//! use std::io::Write;
//!
//! let path = Utf8Path::new("my-file.lock");
//! // The lock is held for the lifetime of the `_lock` variable.
//! let _lock = FileLock::exclusive(path).unwrap();
//! // Now you can safely write to a shared resource.
//! ```

use crate::error::{Error, Result};
use camino::Utf8Path;
use fs2::FileExt;
use std::fs::{File, OpenOptions};

/// Represents a lock on a file.
///
/// The lock is automatically released when this struct is dropped (RAII).
/// This is a wrapper around `fs2::FileExt` to provide a simpler API.
#[derive(Debug)]
pub struct FileLock {
    file: File,
}

impl FileLock {
    /// Acquires an exclusive lock on a file.
    ///
    /// An exclusive lock prevents any other process from acquiring a lock (either exclusive or shared) on the file.
    /// The file will be created if it does not exist.
    ///
    /// # Arguments
    ///
    /// * `path` - The path to the file to lock.
    pub fn exclusive(path: &Utf8Path) -> Result<Self> {
        let file = OpenOptions::new().read(true).write(true).create(true).open(path)?;
        file.lock_exclusive()?;
        Ok(Self { file })
    }

    /// Acquires a shared lock on a file.
    ///
    /// A shared lock allows multiple processes to acquire a shared lock on the same file,
    /// but prevents any process from acquiring an exclusive lock.
    /// The file must exist.
    ///
    /// # Arguments
    ///
    /// * `path` - The path to the file to lock.
    pub fn shared(path: &Utf8Path) -> Result<Self> {
        let file = OpenOptions::new().read(true).open(path)?;
        file.lock_shared()?;
        Ok(Self { file })
    }
}

impl Drop for FileLock {
    fn drop(&mut self) {
        let _ = self.file.unlock();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_exclusive_lock() -> Result<()> {
        let dir = tempdir()?;
        let file_path = Utf8Path::from_path(dir.path()).unwrap().join("lock.txt");

        let _lock = FileLock::exclusive(&file_path)?;

        // This should fail because the file is already locked exclusively.
        assert!(FileLock::exclusive(&file_path).is_err());

        Ok(())
    }

    #[test]
    fn test_shared_lock() -> Result<()> {
        let dir = tempdir()?;
        let file_path = Utf8Path::from_path(dir.path()).unwrap().join("lock.txt");
        std::fs::write(&file_path, "")?;

        let _lock1 = FileLock::shared(&file_path)?;
        let _lock2 = FileLock::shared(&file_path)?;

        // This should fail because the file is locked for sharing.
        assert!(FileLock::exclusive(&file_path).is_err());

        Ok(())
    }
}
