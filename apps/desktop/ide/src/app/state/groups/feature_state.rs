//! Feature state for IDE features

use super::*;

/// Feature state containing IDE feature-specific data
#[derive(Debug)]
pub struct FeatureState {
    // Review and analysis features
    pub review_analysis: ReviewAnalysisState,

    // Editor enhancement features
    pub editor_enhancement: EditorEnhancementState,

    // Development tool features
    pub development_tools: DevelopmentToolState,

    // Additional feature data (types from crate::types)
    pub git_graph: crate::types::git_graph_types::GitGraph,
    pub search_results: Vec<crate::types::git_search_types::SearchResult>,
    pub saved_search_queries: Vec<crate::types::git_search_types::SavedQuery>,
    pub search_stats: Option<crate::types::git_search_types::SearchStats>,
    pub ci_dashboard: crate::types::ci_dashboard::CiDashboard,
    pub selected_pipeline: Option<crate::types::ci_dashboard::Pipeline>,
    pub selected_pipeline_run: Option<crate::types::ci_dashboard::PipelineRun>,
    pub selected_failure_analysis: Option<crate::types::ci_dashboard::FailureAnalysis>,
    pub selected_deployment: Option<crate::types::ci_dashboard::Deployment>,
    pub run_logs: Vec<crate::types::ci_dashboard::LogEntry>,
    pub job_logs: Vec<crate::types::ci_dashboard::LogEntry>,
    pub selected_commit: Option<crate::types::git_graph_types::CommitNode>,
}

impl Default for FeatureState {
    fn default() -> Self {
        Self {
            review_analysis: ReviewAnalysisState::default(),
            editor_enhancement: EditorEnhancementState::default(),
            development_tools: DevelopmentToolState::default(),
            git_graph: crate::types::git_graph_types::GitGraph::default(),
            search_results: Vec::new(),
            saved_search_queries: Vec::new(),
            search_stats: None,
            ci_dashboard: crate::types::ci_dashboard::CiDashboard::default(),
            selected_pipeline: None,
            selected_pipeline_run: None,
            selected_failure_analysis: None,
            selected_deployment: None,
            run_logs: Vec::new(),
            job_logs: Vec::new(),
            selected_commit: None,
        }
    }
}
