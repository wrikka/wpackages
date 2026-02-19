use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorktreeInfo {
    pub name: String,
    pub path: PathBuf,
    pub branch: String,
    pub base_branch: String,
    pub created_at: String,
    pub is_active: bool,
    pub status: WorktreeStatus,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum WorktreeStatus {
    Clean,
    Modified,
    Conflicted,
    OutOfSync,
}

#[derive(Debug, Clone, Default)]
pub struct WorktreeManagerState {
    pub worktrees: Vec<WorktreeInfo>,
    pub selected_worktree: Option<usize>,
    pub show_inactive: bool,
    pub auto_prune: bool,
}

impl WorktreeManagerState {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn add_worktree(&mut self, worktree: WorktreeInfo) {
        self.worktrees.push(worktree);
    }

    pub fn remove_worktree(&mut self, index: usize) {
        if index < self.worktrees.len() {
            self.worktrees.remove(index);
        }
    }

    pub fn select_worktree(&mut self, index: usize) {
        if index < self.worktrees.len() {
            self.selected_worktree = Some(index);
        }
    }

    pub fn get_selected(&self) -> Option<&WorktreeInfo> {
        self.selected_worktree.and_then(|idx| self.worktrees.get(idx))
    }

    pub fn update_status(&mut self, index: usize, status: WorktreeStatus) {
        if index < self.worktrees.len() {
            self.worktrees[index].status = status;
        }
    }

    pub fn set_active(&mut self, index: usize, active: bool) {
        if index < self.worktrees.len() {
            self.worktrees[index].is_active = active;
        }
    }

    pub fn prune_removed(&mut self) {
        self.worktrees.retain(|w| w.path.exists());
    }
}
