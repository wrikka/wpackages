use serde::{Deserialize, Serialize};
use git::types::WorktreeEntry;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorktreeState {
    pub worktrees: Vec<WorktreeEntry>,
    pub selected_worktree: Option<String>,
    pub creating: bool,
    pub new_worktree_name: String,
    pub new_worktree_branch: String,
    pub show_prunable: bool,
}

impl Default for WorktreeState {
    fn default() -> Self {
        Self {
            worktrees: Vec::new(),
            selected_worktree: None,
            creating: false,
            new_worktree_name: String::new(),
            new_worktree_branch: String::new(),
            show_prunable: true,
        }
    }
}
