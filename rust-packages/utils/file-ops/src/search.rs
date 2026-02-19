use crate::error::Result;
use camino::{Utf8Path, Utf8PathBuf};
use walkdir::WalkDir;
use std::fs;

/// Recursively finds files in a directory that contain the given content.
///
/// # Arguments
///
/// * `dir` - The directory to search in.
/// * `query` - The text content to search for.
///
/// # Returns
///
/// A list of paths to files that contain the query.
pub fn find_files_with_content(dir: &Utf8Path, query: &str) -> Result<Vec<Utf8PathBuf>> {
    let mut results = Vec::new();
    for entry in WalkDir::new(dir).into_iter().filter_map(|e| e.ok()) {
        let path = Utf8Path::from_path(entry.path());
        if let Some(path) = path {
            if path.is_file() {
                if let Ok(content) = fs::read_to_string(path) {
                    if content.contains(query) {
                        results.push(path.to_path_buf());
                    }
                }
            }
        }
    }
    Ok(results)
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_find_files_with_content() -> Result<()> {
        let dir = tempdir()?;
        let dir_path = Utf8Path::from_path(dir.path()).unwrap();

        let file1_path = dir_path.join("file1.txt");
        let file2_path = dir_path.join("file2.log");
        let subdir_path = dir_path.join("subdir");
        fs::create_dir(&subdir_path)?;
        let file3_path = subdir_path.join("file3.txt");

        fs::write(&file1_path, "hello world")?;
        fs::write(&file2_path, "another file")?;
        fs::write(&file3_path, "hello again")?;

        let results = find_files_with_content(dir_path, "hello")?;
        assert_eq!(results.len(), 2);
        assert!(results.contains(&file1_path));
        assert!(results.contains(&file3_path));

        let results_again = find_files_with_content(dir_path, "again")?;
        assert_eq!(results_again.len(), 1);
        assert!(results_again.contains(&file3_path));

        let results_none = find_files_with_content(dir_path, "not_found")?;
        assert!(results_none.is_empty());

        Ok(())
    }
}