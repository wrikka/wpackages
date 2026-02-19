use crate::types::{git::RepoSummary, paths::RepoRoot};

#[derive(Default)]
pub struct WorkspaceState {
    pub projects: Vec<String>,
    pub selected_project: Option<usize>,
    pub repos_by_project: Vec<Vec<RepoSummary>>,
    pub selected_repo: Option<RepoRoot>,
    pub loading_projects: bool,
    pub loading_repo: bool,
}
