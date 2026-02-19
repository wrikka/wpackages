use std::path::Path;

/// Get the home directory
pub fn home_dir() -> Option<PathBuf> {
    dirs::home_dir()
}

/// Get the cache directory
pub fn cache_dir() -> PathBuf {
    home_dir()
        .map(|h| h.join(".wmo"))
        .unwrap_or_else(|| PathBuf::from(".wmo"))
        .join("cache")
}

/// Ensure directory exists
pub fn ensure_dir(path: &Path) -> std::io::Result<()> {
    if !path.exists() {
        std::fs::create_dir_all(path)?;
    }
    Ok(())
}

/// Read file content as string
pub fn read_file(path: &Path) -> std::io::Result<String> {
    std::fs::read_to_string(path)
}

/// Write content to file
pub fn write_file(path: &Path, content: &str) -> std::io::Result<()> {
    if let Some(parent) = path.parent() {
        ensure_dir(parent)?;
    }
    std::fs::write(path, content)
}

/// Check if file exists
pub fn file_exists(path: &Path) -> bool {
    path.exists() && path.is_file()
}

/// Check if directory exists
pub fn dir_exists(path: &Path) -> bool {
    path.exists() && path.is_dir()
}

/// Get file size in bytes
pub fn file_size(path: &Path) -> Option<u64> {
    path.metadata().ok().map(|m| m.len())
}

/// Get directory size recursively
pub fn dir_size(path: &Path) -> std::io::Result<u64> {
    let mut total = 0u64;

    for entry in std::fs::read_dir(path)? {
        let entry = entry?;
        let metadata = entry.metadata()?;

        if metadata.is_file() {
            total += metadata.len();
        } else if metadata.is_dir() {
            total += dir_size(&entry.path())?;
        }
    }

    Ok(total)
}

/// Remove directory recursively
pub fn remove_dir_all(path: &Path) -> std::io::Result<()> {
    if path.exists() {
        std::fs::remove_dir_all(path)?;
    }
    Ok(())
}

/// Remove file
pub fn remove_file(path: &Path) -> std::io::Result<()> {
    if path.exists() {
        std::fs::remove_file(path)?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_file_operations() {
        let temp = std::env::temp_dir().join("wmorepo_test");
        let _ = remove_dir_all(&temp);

        assert!(!file_exists(&temp));
        assert!(ensure_dir(&temp).is_ok());
        assert!(dir_exists(&temp));

        let file = temp.join("test.txt");
        assert!(write_file(&file, "test content").is_ok());
        assert!(file_exists(&file));
        assert_eq!(read_file(&file).unwrap(), "test content");
        assert_eq!(file_size(&file).unwrap(), 12);

        let _ = remove_dir_all(&temp);
    }
}
