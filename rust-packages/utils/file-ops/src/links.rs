//! Provides functions for creating file system links.

use crate::error::Result;
use camino::Utf8Path;
use std::fs;

#[cfg(unix)]
use std::os::unix::fs as unix_fs;

/// Creates a hard link.
///
/// A hard link makes a file accessible from a new path, but it points to the same underlying data.
///
/// # Arguments
///
/// * `original` - The path to the original file.
/// * `link` - The path where the new hard link will be created.
///
/// # Example
///
/// ```no_run
/// use file_ops::hard_link;
/// use camino::Utf8Path;
///
/// let original = Utf8Path::new("original.txt");
/// let link = Utf8Path::new("link.txt");
/// // std::fs::write(original, "hello").unwrap(); // Ensure the original file exists
/// hard_link(original, link).unwrap();
/// ```
pub fn hard_link(original: &Utf8Path, link: &Utf8Path) -> Result<()> {
    fs::hard_link(original, link)?;
    Ok(())
}

/// Creates a symbolic link to a file (Unix-only).
///
/// # Arguments
///
/// * `original` - The path the symbolic link will point to.
/// * `link` - The path where the new symbolic link will be created.
#[cfg(unix)]
pub fn symlink_file(original: &Utf8Path, link: &Utf8Path) -> Result<()> {
    unix_fs::symlink(original, link)?;
    Ok(())
}

/// Creates a symbolic link to a directory (Unix-only).
///
/// # Arguments
///
/// * `original` - The path the symbolic link will point to.
/// * `link` - The path where the new symbolic link will be created.
#[cfg(unix)]
pub fn symlink_dir(original: &Utf8Path, link: &Utf8Path) -> Result<()> {
    unix_fs::symlink(original, link)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_hard_link() -> Result<()> {
        let dir = tempdir()?;
        let original_path = Utf8Path::from_path(dir.path()).unwrap().join("original.txt");
        let link_path = Utf8Path::from_path(dir.path()).unwrap().join("link.txt");

        fs::write(&original_path, "hello")?;
        hard_link(&original_path, &link_path)?;

        assert_eq!(fs::read_to_string(&link_path)?, "hello");

        Ok(())
    }

    #[test]
    #[cfg(unix)]
    fn test_symlink() -> Result<()> {
        let dir = tempdir()?;
        let original_path = Utf8Path::from_path(dir.path()).unwrap().join("original.txt");
        let link_path = Utf8Path::from_path(dir.path()).unwrap().join("link.txt");

        fs::write(&original_path, "hello")?;
        symlink_file(&original_path, &link_path)?;

        assert_eq!(fs::read_to_string(&link_path)?, "hello");

        Ok(())
    }
}