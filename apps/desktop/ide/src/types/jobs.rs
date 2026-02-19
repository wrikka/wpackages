use crate::types::fs::FileNode;
use crate::types::git::{BranchSummary, CommitSummary, DiffFile, GitStatusEntry, RepoSummary};
use crate::types::paths::RepoRoot;

#[derive(Debug, Clone)]
pub enum JobRequest {
    ListRepos {
        project_idx: usize,
        project_root: String,
    },
    LoadRepo {
        repo_root: RepoRoot,
    },
}

#[derive(Debug, Clone)]
pub struct RepoData {
    pub branches: Vec<BranchSummary>,
    pub commits: Vec<CommitSummary>,
    pub status: Vec<GitStatusEntry>,
    pub diffs: Vec<DiffFile>,
    pub tree: Vec<FileNode>,
}

#[derive(Debug, Clone)]
pub enum JobResult {
    Repos {
        project_idx: usize,
        repos: Vec<RepoSummary>,
    },
    RepoData {
        repo_root: RepoRoot,
        data: RepoData,
    },
    Error(String),
}
