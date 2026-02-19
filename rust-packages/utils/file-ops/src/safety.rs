//! Provides file safety utilities, such as permission checks and backups.

use crate::error::{Error, Result};
use camino::{Utf8Path, Utf8PathBuf};

/// Checks if the current process has write permissions for a path.
///
/// This function checks if the `readonly` flag is set on the file's permissions.
/// It does not provide a comprehensive check of all possible permission issues.
///
/// # Arguments
///
/// * `path` - The path to check.
///
/// # Example
///
/// ```no_run
/// use file_ops::check_permissions;
/// use camino::Utf8Path;
///
/// let path = Utf8Path::new("my_file.txt");
/// // std::fs::write(path, "").unwrap(); // Ensure the file exists
/// if check_permissions(path).is_ok() {
///     println!("Write permissions are likely available.");
/// }
/// ```
pub fn check_permissions(path: &Utf8Path) -> Result<()> {
    let metadata = std::fs::metadata(path)?;

    let permissions = metadata.permissions();
    if permissions.readonly() {
        return Err(Error::PermissionDenied { path: path.to_path_buf() });
    }

    Ok(())
}

/// Creates a backup of a file.
///
/// The backup file will be created in the same directory with a `.bak` suffix.
/// If a backup file already exists, it will be overwritten.
///
/// # Arguments
///
/// * `path` - The path to the file to back up.
///
/// # Example
///
/// ```no_run
/// use file_ops::backup;
/// use camino::Utf8Path;
///
/// let path = Utf8Path::new("important_data.csv");
/// // std::fs::write(path, "data").unwrap(); // Ensure the file exists
/// let backup_path = backup(path).unwrap();
/// println!("Backup created at: {}", backup_path);
/// ```
pub fn backup(path: &Utf8Path) -> Result<Utf8PathBuf> {
    if !path.exists() {
        return Err(Error::NotFound { path: path.to_path_buf() });
    }

    let backup_path = path.with_extension("bak");

    std::fs::copy(path, &backup_path)?;

    Ok(backup_path)
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_backup_success() {
        let dir = tempdir().unwrap();
        let path = Utf8Path::from_path(dir.path()).unwrap().join("test.txt");
        std::fs::write(&path, "hello").unwrap();

        let backup_path = backup(&path).unwrap();
        assert!(backup_path.exists());
        assert_eq!(backup_path.extension(), Some("bak"));

        let content = std::fs::read_to_string(backup_path).unwrap();
        assert_eq!(content, "hello");
    }

    #[test]
    fn test_backup_not_found() {
        let dir = tempdir().unwrap();
        let path = Utf8Path::from_path(dir.path()).unwrap().join("nonexistent.txt");

        let result = backup(&path);
        assert!(matches!(result, Err(Error::NotFound { .. })));
    }
}
