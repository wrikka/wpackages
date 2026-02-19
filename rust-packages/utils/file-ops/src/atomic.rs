use crate::error::{Error, Result};
use camino::Utf8Path;
use std::io::Write;
use tempfile::NamedTempFile;

/// Atomically writes data to a file.
///
/// This function first writes the data to a temporary file in the same
/// directory as the final destination, and then atomically renames it.
/// This ensures that the destination file is never left in a partially
/// written state.
///
/// # Arguments
///
/// * `path` - The destination file path.
/// * `data` - The data to write.
///
/// # Example
///
/// ```no_run
/// use file_ops::atomic_write;
/// use camino::Utf8Path;
///
/// let path = Utf8Path::new("atomic.txt");
/// atomic_write(path, b"atomic write").unwrap();
/// ```
pub fn atomic_write(path: &Utf8Path, data: &[u8]) -> Result<()> {
    let dir = path.parent().ok_or_else(|| Error::Io {
        path: path.to_path_buf(),
        source: std::io::Error::new(std::io::ErrorKind::NotFound, "Parent directory not found"),
    })?;

    let mut temp_file = NamedTempFile::new_in(dir).map_err(|e| Error::Io {
        path: dir.to_path_buf(),
        source: e,
    })?;

    temp_file.write_all(data).map_err(|e| Error::Io {
        path: path.to_path_buf(),
        source: e,
    })?;

    temp_file.persist(path).map_err(|e| Error::AtomicOperationFailed {
        path: path.to_path_buf(),
        source: e.error.into(),
    })?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_atomic_write_success() {
        let dir = tempdir().unwrap();
        let path = Utf8Path::from_path(dir.path()).unwrap().join("test.txt");
        let data = b"hello world";

        atomic_write(&path, data).unwrap();

        let content = std::fs::read_to_string(&path).unwrap();
        assert_eq!(content, "hello world");
    }

    #[test]
    fn test_atomic_write_overwrite() {
        let dir = tempdir().unwrap();
        let path = Utf8Path::from_path(dir.path()).unwrap().join("test.txt");
        std::fs::write(&path, "initial content").unwrap();

        let new_data = b"new content";
        atomic_write(&path, new_data).unwrap();

        let content = std::fs::read_to_string(&path).unwrap();
        assert_eq!(content, "new content");
    }
}
