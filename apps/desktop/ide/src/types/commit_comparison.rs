use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommitComparisonState {
    pub commit_a: Option<String>,
    pub commit_b: Option<String>,
    pub branch_a: Option<String>,
    pub branch_b: Option<String>,
    pub comparison: Option<ComparisonResult>,
    pub comparing: bool,
    pub show_side_by_side: bool,
    pub show_unified: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComparisonResult {
    pub files: Vec<FileComparison>,
    pub stats: ComparisonStats,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileComparison {
    pub path: String,
    pub status: FileStatus,
    pub additions: usize,
    pub deletions: usize,
    pub changes: Vec<LineChange>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum FileStatus {
    Added,
    Modified,
    Deleted,
    Renamed,
    Copied,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LineChange {
    pub line_a: Option<usize>,
    pub line_b: Option<usize>,
    pub content: String,
    pub change_type: ChangeType,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ChangeType {
    Added,
    Removed,
    Modified,
    Context,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComparisonStats {
    pub total_files: usize,
    pub total_additions: usize,
    pub total_deletions: usize,
    pub added_files: usize,
    pub modified_files: usize,
    pub deleted_files: usize,
}

impl Default for CommitComparisonState {
    fn default() -> Self {
        Self {
            commit_a: None,
            commit_b: None,
            branch_a: None,
            branch_b: None,
            comparison: None,
            comparing: false,
            show_side_by_side: true,
            show_unified: false,
        }
    }
}
