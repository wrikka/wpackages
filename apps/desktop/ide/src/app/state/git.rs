use std::collections::HashMap;

use crate::types::git::{BranchSummary, CommitSummary, DiffFile, GitStatusEntry};

#[derive(Default)]
pub struct GitState {
    pub branches: Vec<BranchSummary>,
    pub commits: Vec<CommitSummary>,
    pub status: Vec<GitStatusEntry>,
    pub diffs: Vec<DiffFile>,
    pub git_status_abs: HashMap<String, String>,
    pub blame_cache_path: Option<String>,
    pub blame_cache: Vec<Option<String>>,
}
