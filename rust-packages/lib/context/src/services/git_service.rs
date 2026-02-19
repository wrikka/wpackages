//! Git service
//!
//! Service for gathering git information from projects.

use std::path::Path;
use std::process::Command;

use super::super::error::{ContextError, ContextResult};
use super::super::types::GitInfo;

/// Git information service.
///
/// Provides methods to retrieve git repository information.
pub struct GitService;

impl GitService {
    /// Gets git information for a project.
    ///
    /// # Arguments
    ///
    /// * `path` - The project root directory path
    ///
    /// # Returns
    ///
    /// Returns `GitInfo` struct containing branch, commit, and status.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use context::services::git_service::GitService;
    /// use std::path::Path;
    ///
    /// let info = GitService::get_info(Path::new("/path/to/project")).unwrap();
    /// println!("Branch: {}", info.branch);
    /// ```
    pub fn get_info(path: &Path) -> ContextResult<GitInfo> {
        let branch = Self::run_git_command(path, &["rev-parse", "--abbrev-ref", "HEAD"])
            .unwrap_or_else(|_| "unknown".to_string());

        let commit = Self::run_git_command(path, &["rev-parse", "HEAD"])
            .unwrap_or_else(|_| "unknown".to_string());

        let status = Self::run_git_command(path, &["status", "--porcelain"])
            .unwrap_or_else(|_| String::new());

        let has_changes = !status.is_empty();

        Ok(GitInfo {
            branch: Some(branch),
            commit: Some(commit),
            remote: Self::run_git_command(path, &["config", "--get", "remote.origin.url"])
                .ok()
                .filter(|s| !s.is_empty()),
            status: Some(status),
            is_dirty: has_changes,
        })
    }

    /// Gets recent commits for a project.
    ///
    /// # Arguments
    ///
    /// * `path` - The project root directory path
    /// * `limit` - Maximum number of commits to retrieve
    ///
    /// # Returns
    ///
    /// Returns a vector of commit hashes.
    pub fn get_recent_commits(path: &Path, limit: usize) -> ContextResult<Vec<String>> {
        let output =
            Self::run_git_command(path, &["log", &format!("-{}", limit), "--pretty=format:%H"])?;
        Ok(output.lines().map(|s| s.to_string()).collect())
    }

    fn run_git_command(path: &Path, args: &[&str]) -> ContextResult<String> {
        let output = Command::new("git").args(args).current_dir(path).output()?;

        if output.status.success() {
            Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
        } else {
            Err(ContextError::AnalysisError(
                String::from_utf8_lossy(&output.stderr).to_string(),
            ))
        }
    }
}
