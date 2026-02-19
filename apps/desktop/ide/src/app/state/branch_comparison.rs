use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BranchComparison {
    pub base_branch: String,
    pub compare_branch: String,
    pub ahead_by: usize,
    pub behind_by: usize,
    pub diverged_commits: Vec<CommitInfo>,
    pub conflict_prediction: ConflictPrediction,
    pub merge_status: MergeStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommitInfo {
    pub hash: String,
    pub message: String,
    pub author: String,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConflictPrediction {
    pub has_conflicts: bool,
    pub conflict_files: Vec<ConflictFile>,
    pub confidence: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConflictFile {
    pub path: String,
    pub conflict_type: ConflictType,
    pub risk_level: RiskLevel,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ConflictType {
    Content,
    Rename,
    Delete,
    Add,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum RiskLevel {
    Low,
    Medium,
    High,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum MergeStatus {
    Clean,
    Conflicts,
    NotFastForward,
}

#[derive(Debug, Clone, Default)]
pub struct BranchComparisonState {
    pub comparisons: Vec<BranchComparison>,
    pub selected_comparison: Option<usize>,
    pub auto_refresh: bool,
    pub show_conflicts_only: bool,
}

impl BranchComparisonState {
    pub fn new() -> Self {
        Self {
            comparisons: Vec::new(),
            selected_comparison: None,
            auto_refresh: true,
            show_conflicts_only: false,
        }
    }

    pub fn add_comparison(&mut self, comparison: BranchComparison) {
        self.comparisons.push(comparison);
    }

    pub fn remove_comparison(&mut self, index: usize) {
        if index < self.comparisons.len() {
            self.comparisons.remove(index);
        }
    }

    pub fn select_comparison(&mut self, index: usize) {
        if index < self.comparisons.len() {
            self.selected_comparison = Some(index);
        }
    }

    pub fn get_selected(&self) -> Option<&BranchComparison> {
        self.selected_comparison
            .and_then(|idx| self.comparisons.get(idx))
    }

    pub fn get_conflicting_comparisons(&self) -> Vec<&BranchComparison> {
        self.comparisons.iter()
            .filter(|c| c.conflict_prediction.has_conflicts)
            .collect()
    }

    pub fn refresh_comparison(&mut self, base: String, compare: String) {
        let comparison = BranchComparison {
            base_branch: base.clone(),
            compare_branch: compare.clone(),
            ahead_by: 0,
            behind_by: 0,
            diverged_commits: Vec::new(),
            conflict_prediction: ConflictPrediction {
                has_conflicts: false,
                conflict_files: Vec::new(),
                confidence: 0.0,
            },
            merge_status: MergeStatus::Clean,
        };
        self.add_comparison(comparison);
    }
}
