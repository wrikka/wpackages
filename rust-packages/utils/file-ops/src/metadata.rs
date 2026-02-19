//! Provides functions for reading and writing extended file metadata.

use crate::error::{Error, Result};
use camino::Utf8Path;
use std::fs;
use std::time::SystemTime;

#[cfg(unix)]
use std::os::unix::fs::PermissionsExt;

/// Represents extended file metadata.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Metadata {
    /// The size of the file in bytes.
    pub len: u64,
    /// `true` if the file is read-only.
    pub readonly: bool,
    /// The last access time.
    pub accessed: SystemTime,
    /// The last modification time.
    pub modified: SystemTime,
    /// The creation time.
    pub created: SystemTime,
    /// The Unix permissions mode (Unix-only).
    #[cfg(unix)]
    pub mode: u32,
}

/// Gets the extended metadata for a file.
///
/// # Example
///
/// ```no_run
/// use file_ops::get_metadata;
/// use camino::Utf8Path;
///
/// let path = Utf8Path::new("my_file.txt");
/// // std::fs::write(path, "hello").unwrap(); // Ensure the file exists
/// let metadata = get_metadata(path).unwrap();
/// println!("File size: {} bytes", metadata.len);
/// ```
pub fn get_metadata(path: &Utf8Path) -> Result<Metadata> {
    let metadata = fs::metadata(path)?;

    Ok(Metadata {
        len: metadata.len(),
        readonly: metadata.permissions().readonly(),
        accessed: metadata.accessed()?,
        modified: metadata.modified()?,
        created: metadata.created()?,
        #[cfg(unix)]
        mode: metadata.permissions().mode(),
    })
}

/// Sets the extended metadata for a file.
///
/// This function currently supports setting the `readonly` flag on all platforms
/// and the `mode` on Unix-like platforms.
///
/// # Example
///
/// ```no_run
/// use file_ops::{get_metadata, set_metadata};
/// use camino::Utf8Path;
///
/// let path = Utf8Path::new("my_file.txt");
/// // std::fs::write(path, "hello").unwrap(); // Ensure the file exists
/// let mut metadata = get_metadata(path).unwrap();
/// metadata.readonly = true;
/// set_metadata(path, &metadata).unwrap();
/// ```
pub fn set_metadata(path: &Utf8Path, metadata: &Metadata) -> Result<()> {
    let mut permissions = fs::metadata(path)?.permissions();

    permissions.set_readonly(metadata.readonly);

    #[cfg(unix)]
    {
        permissions.set_mode(metadata.mode);
    }

    fs::set_permissions(path, permissions)?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_get_set_metadata() -> Result<()> {
        let dir = tempdir()?;
        let file_path = Utf8Path::from_path(dir.path()).unwrap().join("test.txt");
        fs::write(&file_path, "hello")?;

        let initial_metadata = get_metadata(&file_path)?;
        assert!(!initial_metadata.readonly);

        let mut new_metadata = initial_metadata.clone();
        new_metadata.readonly = true;
        #[cfg(unix)]
        {
            new_metadata.mode = 0o100755;
        }

        set_metadata(&file_path, &new_metadata)?;

        let updated_metadata = get_metadata(&file_path)?;
        assert!(updated_metadata.readonly);
        #[cfg(unix)]
        {
            assert_eq!(updated_metadata.mode, 0o100755);
        }

        Ok(())
    }
}
