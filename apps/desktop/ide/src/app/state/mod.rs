use std::sync::mpsc;

use self::chat::ChatState;
use self::editor::EditorState;
use self::extensions::ExtensionsState;
use self::fs::FsState;
use self::git::GitState;
use self::github::GitHubState;
use self::review_dashboard::ReviewDashboardState;
use self::settings::SettingsState;
use self::terminal::TerminalState;
use self::ui::UiState;
use self::workspace::WorkspaceState;

mod state_builder;

pub use state_builder::Default;

use self::debugging::DebuggingState;
use self::testing::TestingState;
use self::tasks::TasksState;
use self::snippets::SnippetsState;
use self::templates::TemplatesState;
use self::macros::MacrosState;
use self::profiler::ProfilerState;
use self::refactoring::RefactoringState;
use self::git_workflow::GitWorkflowState;
use self::ai_completion::AiCompletionState;
use self::advanced_debugging::AdvancedDebuggingState;
use self::advanced_testing::AdvancedTestingState;
use self::performance::PerformanceState;

pub mod breadcrumbs;
pub mod code_folding;
pub mod hierarchy;
pub mod lsp_client;
pub mod minimap;
pub mod multi_cursor;
pub mod navigation;
pub mod outline;
pub mod search;

pub mod debugging;
pub mod testing;
pub mod tasks;
pub mod snippets;
pub mod templates;
pub mod macros;
pub mod profiler;
pub mod refactoring;
pub mod git_workflow;
pub mod ai_completion;
pub mod advanced_debugging;
pub mod advanced_testing;
pub mod performance;

// New feature states
pub mod workspace_switching;
pub mod ai_review;
pub mod lsp_auto_config;
pub mod git_bisect;
pub mod blame_heatmap;
pub mod smart_reflow;
pub mod semantic_search;
pub mod inline_blame;
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

pub mod chat;
pub mod editor;
pub mod extensions;
pub mod fs;
pub mod git;
pub mod github;
pub mod review_dashboard;
pub mod settings;
pub mod terminal;
pub mod ui;
pub mod workspace;

pub mod groups;

pub use crate::types::editor::OpenFileTab;
pub use crate::types::branch_graph::BranchGraphState;
pub use crate::types::git_search::GitSearchState;
pub use crate::types::git_analytics::GitAnalyticsState;
pub use crate::types::ci_cd::CiCdState;
pub use crate::types::review_checklist::ReviewChecklistState;
pub use crate::types::commit_comparison::CommitComparisonState;
pub use crate::types::diff_navigation::DiffNavigationState;
pub use crate::types::worktree::WorktreeState;
pub use ui::CenterPanel as CenterTab;

#[derive(Debug)]
pub enum TerminalEvent {
    DataReceived { session_id: u32, data: Vec<u8> },
    SessionExited { session_id: u32 },
    SessionCreated { tab_id: String, session_id: u32 },
}

pub struct IdeState {
    pub core: groups::CoreState,
    pub features: groups::FeatureState,
    pub services: groups::ServiceState,
    pub channels: groups::ChannelState,
}


impl IdeState {
    pub fn set_error(&mut self, err: impl ToString) {
        self.core.ui.last_error = Some(err.to_string());
    }

    pub fn clear_error(&mut self) {
        self.core.ui.last_error = None;
    }

    pub fn reset_selection(&mut self) {
        self.core.workspace.selected_repo = None;
        self.core.fs.selected_file = None;
        self.core.editor.selected_text.clear();
        self.core.editor.editor_dirty = false;
        self.core.fs.file_tree.clear();
        self.core.git.git_status_abs.clear();
        self.core.editor.open_files.clear();
        self.core.editor.active_file = None;
        self.core.fs.rename_target = None;
        self.core.fs.rename_buffer.clear();
        self.core.fs.new_entry_parent = None;
        self.core.fs.new_entry_is_dir = false;
        self.core.fs.new_entry_buffer.clear();
    }

    // Re-exports for backward compatibility
    pub fn review_dashboard(&mut self) -> &mut crate::types::review_dashboard_types::ReviewDashboard {
        &mut self.features.review_analysis.review_dashboard
    }

    pub fn review_service(&mut self) -> Option<std::sync::Arc<dyn crate::services::review_service::ReviewService>> {
        self.services.review_service.clone()
    }
}
