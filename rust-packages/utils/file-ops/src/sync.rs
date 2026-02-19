//! Provides functionality for synchronizing the contents of two directories.

use camino::{Utf8Path, Utf8PathBuf};
use std::collections::HashSet;
use walkdir::WalkDir;

use crate::core_ops::{copy, delete as remove_file, CopyOptions};
use crate::error::Error;
use crate::progress::{Progress, ProgressCallback};

/// Options to control the synchronization behavior.
#[derive(Default)]
pub struct SyncOptions<'a> {
    /// If `true`, existing files in the destination will be overwritten if the source is newer.
    pub overwrite: bool,
    /// If `true`, files in the destination that are not present in the source will be deleted.
    pub delete_extraneous: bool,
    /// An optional callback to report progress on file copy operations.
    pub progress_callback: Option<ProgressCallback<'a>>,
}

impl<'a> Clone for SyncOptions<'a> {
    fn clone(&self) -> Self {
        Self {
            overwrite: self.overwrite,
            delete_extraneous: self.delete_extraneous,
            progress_callback: None, // Cannot clone a closure
        }
    }
}

impl<'a> std::fmt::Debug for SyncOptions<'a> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("SyncOptions")
            .field("overwrite", &self.overwrite)
            .field("delete_extraneous", &self.delete_extraneous)
            .field("has_progress_callback", &self.progress_callback.is_some())
            .finish()
    }
}

/// Synchronizes the contents of a source directory to a destination directory.
///
/// This function copies new or modified files from the source to the destination
/// and can optionally delete files from the destination that are not in the source.
///
/// # Arguments
///
/// * `from` - The source directory.
/// * `to` - The destination directory.
/// * `options` - Synchronization options.
///
/// # Example
///
/// ```no_run
/// use file_ops::{synchronize, SyncOptions};
/// use camino::Utf8Path;
///
/// let from = Utf8Path::new("source_dir");
/// let to = Utf8Path::new("dest_dir");
/// // std::fs::create_dir_all(from).unwrap(); // Ensure directories exist
/// // std::fs::create_dir_all(to).unwrap();
/// let options = SyncOptions { 
///     overwrite: true, 
///     delete_extraneous: true, 
///     ..Default::default() 
/// };
/// synchronize(from, to, &options).unwrap();
/// ```
pub fn synchronize(from: &Utf8Path, to: &Utf8Path, options: &SyncOptions) -> Result<(), Error> {
    if !from.is_dir() {
        return Err(Error::NotADirectory(from.to_path_buf()));
    }
    if !to.is_dir() {
        std::fs::create_dir_all(to)?;
    }

    let mut source_files = HashSet::new();
    let mut files_to_copy = Vec::new();
    let mut total_bytes = 0;

    // Single pass to gather all required information
    for entry in WalkDir::new(from).into_iter().filter_map(Result::ok) {
        let source_path = Utf8Path::from_path(entry.path()).ok_or_else(|| Error::InvalidPath(entry.path().to_path_buf()))?;
        if source_path.is_file() {
            let relative_path = source_path.strip_prefix(from)
                .map_err(|_| Error::InvalidPath(from.as_std_path().to_path_buf()))?;
            source_files.insert(relative_path.to_path_buf());

            let dest_path = to.join(relative_path);

            let should_copy = if !dest_path.exists() {
                true
            } else if options.overwrite {
                let source_meta = source_path.metadata()?;
                let dest_meta = dest_path.metadata()?;
                source_meta.modified()? > dest_meta.modified()?
            } else {
                false
            };

            if should_copy {
                let file_size = source_path.metadata()?.len();
                total_bytes += file_size;
                files_to_copy.push((source_path.to_path_buf(), dest_path, file_size));
            }
        }
    }

    let mut transferred_bytes = 0;
    for (source_path, dest_path, file_size) in files_to_copy {
        if let Some(parent) = dest_path.parent() {
            if !parent.exists() {
                std::fs::create_dir_all(parent)?;
            }
        }
        copy(&source_path, &dest_path, &CopyOptions { overwrite: true, ..Default::default() })?;
        transferred_bytes += file_size;
        if let Some(callback) = &options.progress_callback {
            callback(Progress { total_bytes, transferred_bytes });
        }
    }

    if options.delete_extraneous {
        for entry in WalkDir::new(to).into_iter().filter_map(Result::ok) {
            let dest_path = Utf8Path::from_path(entry.path()).ok_or_else(|| Error::InvalidPath(entry.path().to_path_buf()))?;
            if dest_path.is_file() {
                let relative_path = dest_path.strip_prefix(to)
                    .map_err(|_| Error::InvalidPath(to.as_std_path().to_path_buf()))?;
                if !source_files.contains(relative_path) {
                    remove_file(dest_path)?;
                }
            }
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::sync::{Arc, Mutex};
    use tempfile::tempdir;

    #[test]
    fn test_synchronize_simple_copy() -> Result<(), Error> {
        let from_dir = tempdir()?;
        let to_dir = tempdir()?;
        let from_path = Utf8Path::from_path(from_dir.path()).unwrap();
        let to_path = Utf8Path::from_path(to_dir.path()).unwrap();

        fs::write(from_path.join("file1.txt"), "hello")?;
        fs::create_dir(from_path.join("subdir"))?;
        fs::write(from_path.join("subdir/file2.txt"), "world")?;

        synchronize(from_path, to_path, &Default::default())?;

        assert!(to_path.join("file1.txt").exists());
        assert_eq!(fs::read_to_string(to_path.join("file1.txt"))?, "hello");
        assert!(to_path.join("subdir/file2.txt").exists());

        Ok(())
    }

    #[test]
    fn test_synchronize_delete_extraneous() -> Result<(), Error> {
        let from_dir = tempdir()?;
        let to_dir = tempdir()?;
        let from_path = Utf8Path::from_path(from_dir.path()).unwrap();
        let to_path = Utf8Path::from_path(to_dir.path()).unwrap();

        fs::write(from_path.join("file1.txt"), "hello")?;
        fs::write(to_path.join("extraneous.txt"), "delete me")?;

        synchronize(
            from_path,
            to_path,
            &SyncOptions {
                delete_extraneous: true,
                ..Default::default()
            },
        )?;

        assert!(to_path.join("file1.txt").exists());
        assert!(!to_path.join("extraneous.txt").exists());

        Ok(())
    }

    #[test]
    fn test_synchronize_progress_callback() -> Result<(), Error> {
        let from_dir = tempdir()?;
        let to_dir = tempdir()?;
        let from_path = Utf8Path::from_path(from_dir.path()).unwrap();
        let to_path = Utf8Path::from_path(to_dir.path()).unwrap();

        fs::write(from_path.join("file1.txt"), "hello")?; // 5 bytes
        fs::write(from_path.join("file2.txt"), "world")?; // 5 bytes

        let progress_data = Arc::new(Mutex::new(Vec::new()));
        let progress_data_clone = progress_data.clone();

        let options = SyncOptions {
            progress_callback: Some(Box::new(move |progress| {
                progress_data_clone.lock().unwrap().push(progress);
            })),
            ..Default::default()
        };

        synchronize(from_path, to_path, &options)?;

        let progress_reports = progress_data.lock().unwrap();
        assert_eq!(progress_reports.len(), 2);
        assert_eq!(progress_reports[0].total_bytes, 10);
        assert_eq!(progress_reports[0].transferred_bytes, 5);
        assert_eq!(progress_reports[1].total_bytes, 10);
        assert_eq!(progress_reports[1].transferred_bytes, 10);

        Ok(())
    }
}
