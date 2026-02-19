//! Review and analysis feature states

use super::*;

/// Review and analysis feature states
#[derive(Debug)]
pub struct ReviewAnalysisState {
    pub review_dashboard: ReviewDashboardState,
    pub branch_graph: BranchGraphState,
    pub git_search: GitSearchState,
    pub git_analytics: GitAnalyticsState,
    pub ci_cd: CiCdState,
    pub review_checklist: ReviewChecklistState,
    pub commit_comparison: CommitComparisonState,
    pub diff_navigation: DiffNavigationState,
    pub worktree: WorktreeState,
}

impl Default for ReviewAnalysisState {
    fn default() -> Self {
        Self {
            review_dashboard: ReviewDashboardState::default(),
            branch_graph: BranchGraphState::default(),
            git_search: GitSearchState::default(),
            git_analytics: GitAnalyticsState::default(),
            ci_cd: CiCdState::default(),
            review_checklist: ReviewChecklistState::default(),
            commit_comparison: CommitComparisonState::default(),
            diff_navigation: DiffNavigationState::default(),
            worktree: WorktreeState::default(),
        }
    }
}
