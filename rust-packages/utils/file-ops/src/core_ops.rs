//! Provides core file system operations like copy, move, and delete.

use crate::constants::DEFAULT_BUFFER_SIZE;
use crate::error::{Error, Result};
use crate::progress::{Progress, ProgressCallback};
use camino::Utf8Path;
use std::fs::File;
use std::io::{Read, Write};

/// Creates a backup of a file by appending `.bak` extension.
fn backup_file(path: &Utf8Path) -> Result<()> {
    let backup_path = path.with_extension("bak");
    std::fs::copy(path, &backup_path)?;
    Ok(())
}

/// Options for moving a file.
#[derive(Debug, Clone, Default)]
pub struct MoveOptions {
    /// If `true`, the destination file will be overwritten if it exists.
    pub overwrite: bool,
    /// If `true`, the operation will be skipped if the destination file already exists.
    pub skip_existing: bool,
    /// If `true`, a backup of the destination file will be created before overwriting.
    pub backup: bool,
}

/// Options for copying a file.
#[derive(Default)]
pub struct CopyOptions<'a> {
    /// If `true`, the destination file will be overwritten if it exists.
    pub overwrite: bool,
    /// If `true`, the operation will be skipped if the destination file already exists.
    pub skip_existing: bool,
    /// If `true`, a backup of the destination file will be created before overwriting.
    pub backup: bool,
    /// An optional callback for progress updates.
    pub progress_callback: Option<ProgressCallback<'a>>,
}

impl<'a> Clone for CopyOptions<'a> {
    fn clone(&self) -> Self {
        Self {
            overwrite: self.overwrite,
            skip_existing: self.skip_existing,
            backup: self.backup,
            progress_callback: None, // Cannot clone a closure
        }
    }
}

impl<'a> std::fmt::Debug for CopyOptions<'a> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("CopyOptions")
            .field("overwrite", &self.overwrite)
            .field("skip_existing", &self.skip_existing)
            .field("backup", &self.backup)
            .field("has_progress_callback", &self.progress_callback.is_some())
            .finish()
    }
}

/// Copies a file from a source path to a destination path.
///
/// # Example
///
/// ```no_run
/// use file_ops::{copy, CopyOptions};
/// use camino::Utf8Path;
///
/// let from = Utf8Path::new("source.txt");
/// let to = Utf8Path::new("dest.txt");
/// let options = CopyOptions { overwrite: true, ..Default::default() };
/// copy(from, to, &options).unwrap();
/// ```
pub fn copy(from: &Utf8Path, to: &Utf8Path, options: &CopyOptions) -> Result<()> {
    if to.exists() {
        if options.skip_existing {
            return Ok(());
        }
        if !options.overwrite {
            return Err(Error::AlreadyExists { path: to.to_path_buf() });
        }
        if options.backup {
            backup_file(to)?;
        }
    }

    let mut from_file = File::open(from)?;
    let mut to_file = File::create(to)?;
    let total_bytes = from_file.metadata().map(|m| m.len()).unwrap_or(0);

    crate::stream::stream_data(
        &mut from_file,
        &mut to_file,
        total_bytes,
        &options.progress_callback,
    )?;

    Ok(())
}

/// Moves (renames) a file from a source path to a destination path.
///
/// This function will attempt to rename the file. If the rename fails due to a 
/// cross-device link error, it will fall back to a copy-and-delete operation.
///
/// # Example
///
/// ```no_run
/// use file_ops::{move_file, MoveOptions};
/// use camino::Utf8Path;
///
/// let from = Utf8Path::new("source.txt");
/// let to = Utf8Path::new("dest.txt");
/// move_file(from, to, &Default::default()).unwrap();
/// ```
pub fn move_file(from: &Utf8Path, to: &Utf8Path, options: &MoveOptions) -> Result<()> {
     if to.exists() {
        if options.skip_existing {
            return Ok(());
        }
        if !options.overwrite {
            return Err(Error::AlreadyExists { path: to.to_path_buf() });
        }
        if options.backup {
            backup_file(to)?;
        }
    }

    if let Err(e) = std::fs::rename(from, to) {
        if e.kind() == std::io::ErrorKind::CrossesDevices {
            let copy_options = CopyOptions {
                overwrite: options.overwrite,
                skip_existing: options.skip_existing,
                backup: options.backup,
                ..Default::default()
            };
            copy(from, to, &copy_options)?;
            delete(from)?;
        } else {
            return Err(Error::Io { path: from.to_path_buf(), source: e });
        }
    }

    Ok(())
}

/// Deletes a file.
///
/// # Example
///
/// ```no_run
/// use file_ops::delete;
/// use camino::Utf8Path;
///
/// let path = Utf8Path::new("file_to_delete.txt");
/// delete(path).unwrap();
/// ```
pub fn delete(path: &Utf8Path) -> Result<()> {
    std::fs::remove_file(path).map_err(|e| Error::Io {
        path: path.to_path_buf(),
        source: e,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_copy_success() {
        let dir = tempdir().unwrap();
        let from = Utf8Path::from_path(dir.path()).unwrap().join("from.txt");
        let to = Utf8Path::from_path(dir.path()).unwrap().join("to.txt");
        std::fs::write(&from, "hello").unwrap();

        copy(&from, &to, &CopyOptions::default()).unwrap();
        assert!(to.exists());
        assert_eq!(std::fs::read_to_string(&to).unwrap(), "hello");
    }

    #[test]
    fn test_copy_overwrite() {
        let dir = tempdir().unwrap();
        let from = Utf8Path::from_path(dir.path()).unwrap().join("from.txt");
        let to = Utf8Path::from_path(dir.path()).unwrap().join("to.txt");
        std::fs::write(&from, "new").unwrap();
        std::fs::write(&to, "old").unwrap();

        copy(&from, &to, &CopyOptions { overwrite: true, ..Default::default() }).unwrap();
        assert_eq!(std::fs::read_to_string(&to).unwrap(), "new");
    }

    #[test]
    fn test_copy_backup() {
        let dir = tempdir().unwrap();
        let from = Utf8Path::from_path(dir.path()).unwrap().join("from.txt");
        let to = Utf8Path::from_path(dir.path()).unwrap().join("to.txt");
        std::fs::write(&from, "new").unwrap();
        std::fs::write(&to, "old").unwrap();

        copy(&from, &to, &CopyOptions { overwrite: true, backup: true, ..Default::default() }).unwrap();
        
        let backup_path = to.with_extension("bak");
        assert!(backup_path.exists());
        assert_eq!(std::fs::read_to_string(&backup_path).unwrap(), "old");
        assert_eq!(std::fs::read_to_string(&to).unwrap(), "new");
    }

     #[test]
    fn test_move_success() {
        let dir = tempdir().unwrap();
        let from = Utf8Path::from_path(dir.path()).unwrap().join("from.txt");
        let to = Utf8Path::from_path(dir.path()).unwrap().join("to.txt");
        std::fs::write(&from, "hello").unwrap();

        move_file(&from, &to, &MoveOptions::default()).unwrap();
        assert!(!from.exists());
        assert!(to.exists());
        assert_eq!(std::fs::read_to_string(&to).unwrap(), "hello");
    }

    #[test]
    fn test_delete_success() {
        let dir = tempdir().unwrap();
        let path = Utf8Path::from_path(dir.path()).unwrap().join("test.txt");
        std::fs::write(&path, "hello").unwrap();

        delete(&path).unwrap();
        assert!(!path.exists());
    }
}
