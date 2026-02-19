use serde::{Deserialize, Serialize};
use git_analytics::{AnalyticsReport, CommitMetrics, ContributorMetrics};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitAnalyticsState {
    pub report: Option<AnalyticsReport>,
    pub generating: bool,
    pub show_contributors: bool,
    pub show_commits: bool,
    pub show_branches: bool,
    pub selected_contributor: Option<String>,
}

impl Default for GitAnalyticsState {
    fn default() -> Self {
        Self {
            report: None,
            generating: false,
            show_contributors: true,
            show_commits: true,
            show_branches: true,
            selected_contributor: None,
        }
    }
}
