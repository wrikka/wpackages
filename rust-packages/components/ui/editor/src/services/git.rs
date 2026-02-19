use crate::buffer::TextBuffer;
use crate::error::BufferResult;
use crate::types::{Position, Range};
use std::collections::HashMap;
use std::path::Path;

/// Git file status
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum GitStatus {
    /// Unmodified
    Unmodified,
    /// Modified
    Modified,
    /// Added
    Added,
    /// Deleted
    Deleted,
    /// Renamed
    Renamed,
    /// Copied
    Copied,
    /// Untracked
    Untracked,
    /// Ignored
    Ignored,
}

impl GitStatus {
    pub fn is_modified(&self) -> bool {
        matches!(self, Self::Modified | Self::Added | Self::Deleted | Self::Renamed | Self::Copied)
    }

    pub fn is_untracked(&self) -> bool {
        matches!(self, Self::Untracked)
    }
}

/// Git diff hunk
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DiffHunk {
    pub old_start: usize,
    pub old_lines: usize,
    pub new_start: usize,
    pub new_lines: usize,
    pub header: String,
}

/// Git diff line
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum DiffLine {
    /// Context line
    Context(String),
    /// Added line
    Added(String),
    /// Removed line
    Removed(String),
}

/// Git diff result
#[derive(Debug, Clone)]
pub struct GitDiff {
    pub file_path: String,
    pub status: GitStatus,
    pub hunks: Vec<(DiffHunk, Vec<DiffLine>)>,
}

/// Git service
#[derive(Debug, Clone)]
pub struct GitService {
    repo_path: Option<String>,
}

impl Default for GitService {
    fn default() -> Self {
        Self::new()
    }
}

impl GitService {
    pub fn new() -> Self {
        Self {
            repo_path: None,
        }
    }

    pub fn with_repo(path: String) -> Self {
        Self {
            repo_path: Some(path),
        }
    }

    pub fn repo_path(&self) -> Option<&String> {
        self.repo_path.as_ref()
    }

    pub fn set_repo_path(&mut self, path: String) {
        self.repo_path = Some(path);
    }

    /// Check if current directory is a git repository
    pub fn is_repo(&self) -> bool {
        if let Some(path) = &self.repo_path {
            Path::new(path).join(".git").exists()
        } else {
            false
        }
    }

    /// Get git status for a file
    pub fn get_file_status(&self, file_path: &Path) -> BufferResult<GitStatus> {
        if !self.is_repo() {
            return Ok(GitStatus::Untracked);
        }

        // For now, return Unmodified as a placeholder
        // In a real implementation, this would call git commands
        Ok(GitStatus::Unmodified)
    }

    /// Get git diff for a file
    pub fn get_diff(&self, file_path: &Path) -> BufferResult<GitDiff> {
        if !self.is_repo() {
            return Ok(GitDiff {
                file_path: file_path.to_string_lossy().to_string(),
                status: GitStatus::Unmodified,
                hunks: Vec::new(),
            });
        }

        // For now, return empty diff as a placeholder
        // In a real implementation, this would call git diff
        Ok(GitDiff {
            file_path: file_path.to_string_lossy().to_string(),
            status: GitStatus::Unmodified,
            hunks: Vec::new(),
        })
    }

    /// Get all modified files
    pub fn get_modified_files(&self) -> BufferResult<Vec<String>> {
        if !self.is_repo() {
            return Ok(Vec::new());
        }

        // For now, return empty list as a placeholder
        // In a real implementation, this would call git status
        Ok(Vec::new())
    }

    /// Get git blame for a line
    pub fn get_blame(&self, file_path: &Path, line: usize) -> BufferResult<Option<GitBlame>> {
        if !self.is_repo() {
            return Ok(None);
        }

        // For now, return None as a placeholder
        // In a real implementation, this would call git blame
        Ok(None)
    }

    /// Get git log for a file
    pub fn get_log(&self, file_path: &Path, limit: usize) -> BufferResult<Vec<GitCommit>> {
        if !self.is_repo() {
            return Ok(Vec::new());
        }

        // For now, return empty list as a placeholder
        // In a real implementation, this would call git log
        Ok(Vec::new())
    }
}

/// Git blame information
#[derive(Debug, Clone)]
pub struct GitBlame {
    pub commit_hash: String,
    pub author: String,
    pub author_email: String,
    pub author_time: String,
    pub summary: String,
}

/// Git commit information
#[derive(Debug, Clone)]
pub struct GitCommit {
    pub hash: String,
    pub author: String,
    pub author_email: String,
    pub author_time: String,
    pub summary: String,
    pub message: String,
}

/// Git integration for editor
#[derive(Debug, Clone)]
pub struct GitIntegration {
    service: GitService,
    file_statuses: HashMap<String, GitStatus>,
}

impl Default for GitIntegration {
    fn default() -> Self {
        Self::new()
    }
}

impl GitIntegration {
    pub fn new() -> Self {
        Self {
            service: GitService::new(),
            file_statuses: HashMap::new(),
        }
    }

    pub fn with_repo(path: String) -> Self {
        Self {
            service: GitService::with_repo(path),
            file_statuses: HashMap::new(),
        }
    }

    pub fn service(&self) -> &GitService {
        &self.service
    }

    pub fn service_mut(&mut self) -> &mut GitService {
        &mut self.service
    }

    /// Update file status
    pub fn update_file_status(&mut self, file_path: &str) -> BufferResult<GitStatus> {
        let path = Path::new(file_path);
        let status = self.service.get_file_status(path)?;
        self.file_statuses.insert(file_path.to_string(), status);
        Ok(status)
    }

    /// Get cached file status
    pub fn get_file_status(&self, file_path: &str) -> Option<GitStatus> {
        self.file_statuses.get(file_path).copied()
    }

    /// Refresh all file statuses
    pub fn refresh_statuses(&mut self) -> BufferResult<()> {
        let modified_files = self.service.get_modified_files()?;
        for file in modified_files {
            self.update_file_status(&file)?;
        }
        Ok(())
    }

    /// Get diff for a file
    pub fn get_diff(&self, file_path: &str) -> BufferResult<GitDiff> {
        let path = Path::new(file_path);
        self.service.get_diff(path)
    }

    /// Get blame for a line
    pub fn get_blame(&self, file_path: &str, line: usize) -> BufferResult<Option<GitBlame>> {
        let path = Path::new(file_path);
        self.service.get_blame(path, line)
    }

    /// Get log for a file
    pub fn get_log(&self, file_path: &str, limit: usize) -> BufferResult<Vec<GitCommit>> {
        let path = Path::new(file_path);
        self.service.get_log(path, limit)
    }

    /// Get all modified files
    pub fn get_modified_files(&self) -> Vec<String> {
        self.file_statuses
            .iter()
            .filter(|(_, status)| status.is_modified())
            .map(|(path, _)| path.clone())
            .collect()
    }

    /// Get all untracked files
    pub fn get_untracked_files(&self) -> Vec<String> {
        self.file_statuses
            .iter()
            .filter(|(_, status)| status.is_untracked())
            .map(|(path, _)| path.clone())
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_git_service_creation() {
        let service = GitService::new();
        assert!(service.repo_path().is_none());
    }

    #[test]
    fn test_git_service_with_repo() {
        let service = GitService::with_repo("/path/to/repo".to_string());
        assert_eq!(service.repo_path(), Some(&"/path/to/repo".to_string()));
    }

    #[test]
    fn test_git_status() {
        assert!(!GitStatus::Unmodified.is_modified());
        assert!(GitStatus::Modified.is_modified());
        assert!(GitStatus::Untracked.is_untracked());
    }

    #[test]
    fn test_git_integration() {
        let integration = GitIntegration::new();
        assert_eq!(integration.get_file_status("test.txt"), None);
    }
}
