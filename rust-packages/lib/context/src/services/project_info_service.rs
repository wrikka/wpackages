//! Project information service
//!
//! Service for gathering project metadata and file information.

use std::fs;
use std::path::{Path, PathBuf};

use super::super::error::ContextResult;

/// Project information service.
///
/// Provides methods to retrieve project metadata and file listings.
pub struct ProjectInfoService;

impl ProjectInfoService {
    /// Gets recent files modified in a project.
    ///
    /// # Arguments
    ///
    /// * `path` - The project root directory path
    ///
    /// # Returns
    ///
    /// Returns a vector of file paths sorted by modification time.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use context::services::project_info_service::ProjectInfoService;
    /// use std::path::Path;
    ///
    /// let files = ProjectInfoService::get_recent_files(Path::new("/path/to/project")).unwrap();
    /// for file in files {
    ///     println!("{:?}", file);
    /// }
    /// ```
    pub fn get_recent_files(path: &Path) -> ContextResult<Vec<PathBuf>> {
        let mut files = Vec::new();

        fn visit_dir(dir: &Path, files: &mut Vec<PathBuf>) -> std::io::Result<()> {
            if dir.is_dir() {
                for entry in fs::read_dir(dir)? {
                    let entry = entry?;
                    let path = entry.path();
                    if path.is_dir() {
                        if !path.ends_with(".git") && !path.ends_with("node_modules") {
                            visit_dir(&path, files)?;
                        }
                    } else {
                        files.push(path);
                    }
                }
            }
            Ok(())
        }

        visit_dir(path, &mut files)?;

        files.sort_by(|a, b| {
            let a_meta = fs::metadata(a);
            let b_meta = fs::metadata(b);

            match (a_meta, b_meta) {
                (Ok(a_m), Ok(b_m)) => {
                    let a_time = a_m.modified().unwrap_or(std::time::SystemTime::UNIX_EPOCH);
                    let b_time = b_m.modified().unwrap_or(std::time::SystemTime::UNIX_EPOCH);
                    b_time.cmp(&a_time)
                }
                _ => std::cmp::Ordering::Equal,
            }
        });

        Ok(files.into_iter().take(100).collect())
    }

    /// Gets the total size of a project in bytes.
    ///
    /// # Arguments
    ///
    /// * `path` - The project root directory path
    ///
    /// # Returns
    ///
    /// Returns the total size in bytes.
    pub fn get_project_size(path: &Path) -> ContextResult<u64> {
        let mut total_size = 0u64;

        fn visit_dir(dir: &Path, total_size: &mut u64) -> std::io::Result<()> {
            if dir.is_dir() {
                for entry in fs::read_dir(dir)? {
                    let entry = entry?;
                    let path = entry.path();
                    if path.is_dir() {
                        if !path.ends_with(".git") && !path.ends_with("node_modules") {
                            visit_dir(&path, total_size)?;
                        }
                    } else if let Ok(metadata) = fs::metadata(&path) {
                        *total_size += metadata.len();
                    }
                }
            }
            Ok(())
        }

        visit_dir(path, &mut total_size)?;

        Ok(total_size)
    }
}
