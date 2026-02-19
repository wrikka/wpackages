use crate::app::state::{ui::CenterPanel, IdeState};

pub mod branch_graph;
pub mod ci_cd;
pub mod commit_comparison;
pub mod diff_navigation;
pub mod editor;
pub mod extensions;
pub mod git;
pub mod git_analytics;
pub mod git_search;
pub mod github;
pub mod review_checklist;
pub mod review_dashboard;
pub mod settings;
pub mod worktree;

// New feature panels
pub mod workspace_switching;
pub mod ai_review;
pub mod lsp_auto_config;
pub mod git_bisect;
pub mod blame_heatmap;
pub mod semantic_search;
pub mod stacked_prs;
pub mod terminal_replay;
pub mod code_archaeology;
pub mod dependency_graph;
pub mod ai_commit_gen;
pub mod worktree_manager;
pub mod performance_profiler;
pub mod documentation_mode;
pub mod keyboard_macros;
pub mod remote_container;
pub mod smart_snippets;
pub mod code_ownership;
pub mod refactoring_preview;
pub mod offline_ai;
pub mod branch_comparison;

pub fn render(ui: &mut egui::Ui, state: &mut IdeState) {
    match state.ui.center_tab {
        CenterPanel::Editor => editor::render(ui, state),
        CenterPanel::Git => git::render(ui, state),
        CenterPanel::Extensions => extensions::render(ui, state),
        CenterPanel::Settings => settings::render(ui, state),
        CenterPanel::GitHub => github::render(ui, state),
    }
}
