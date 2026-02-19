//! Provides RAII-style temporary file and directory management.
//!
//! This module wraps the `tempfile` crate to provide `TempFile` and `TempDir` structs
//! that automatically clean up their associated filesystem resources when they go out of scope.

use crate::error::{Error, Result};
use camino::{Utf8Path, Utf8PathBuf};
use tempfile::{NamedTempFile, TempDir as TempDirInner};

/// A temporary file that is automatically deleted when it goes out of scope.
///
/// # Example
///
/// ```no_run
/// use file_ops::TempFile;
/// use std::fs;
///
/// let temp_file = TempFile::new().unwrap();
/// fs::write(temp_file.path(), "temporary content").unwrap();
/// // temp_file is dropped here, and the file is deleted.
/// ```
#[derive(Debug)]
pub struct TempFile {
    file: NamedTempFile,
    path: Utf8PathBuf,
}

impl TempFile {
    /// Creates a new temporary file in the system's temporary directory.
    pub fn new() -> Result<Self> {
        let file = NamedTempFile::new()?;
        let path = Utf8PathBuf::from_path_buf(file.path().to_path_buf())
            .map_err(|p| Error::InvalidPath(p.into()))?;
        Ok(Self { file, path })
    }

    /// Returns the path to the temporary file.
    pub fn path(&self) -> &Utf8Path {
        &self.path
    }

    /// Persists the temporary file, moving it to a new location.
    ///
    /// After this operation, the file will no longer be automatically deleted.
    ///
    /// # Arguments
    ///
    /// * `path` - The path to move the temporary file to.
    pub fn persist(self, path: &Utf8Path) -> Result<()> {
        self.file.persist(path)?;
        Ok(())
    }
}

/// A temporary directory that is automatically deleted when it goes out of scope.
///
/// # Example
///
/// ```no_run
/// use file_ops::TempDir;
/// use std::fs;
///
/// let temp_dir = TempDir::new().unwrap();
/// fs::write(temp_dir.path().join("file.txt"), "temporary content").unwrap();
/// // temp_dir is dropped here, and the directory and its contents are deleted.
/// ```
#[derive(Debug)]
pub struct TempDir {
    _dir: TempDirInner,
    path: Utf8PathBuf,
}

impl TempDir {
    /// Creates a new temporary directory in the system's temporary directory.
    pub fn new() -> Result<Self> {
        let dir = TempDirInner::new()?;
        let path = Utf8PathBuf::from_path_buf(dir.path().to_path_buf())
            .map_err(|p| Error::InvalidPath(p.into()))?;
        Ok(Self { _dir: dir, path })
    }

    /// Returns the path to the temporary directory.
    pub fn path(&self) -> &Utf8Path {
        &self.path
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    #[test]
    fn test_temp_file() -> Result<()> {
        let temp_file = TempFile::new()?;
        fs::write(temp_file.path(), "hello")?;
        assert!(temp_file.path().exists());
        let path = temp_file.path().to_path_buf();
        drop(temp_file);
        assert!(!path.exists());
        Ok(())
    }

    #[test]
    fn test_temp_dir() -> Result<()> {
        let temp_dir = TempDir::new()?;
        fs::write(temp_dir.path().join("file.txt"), "hello")?;
        assert!(temp_dir.path().exists());
        let path = temp_dir.path().to_path_buf();
        drop(temp_dir);
        assert!(!path.exists());
        Ok(())
    }
}
