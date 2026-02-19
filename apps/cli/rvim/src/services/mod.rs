// Service modules for I/O operations
pub mod ai_service;
pub mod api_client_service;
pub mod collaboration;
pub mod database_explorer_service;
pub mod debugger_service;
pub mod editor_context;
pub mod git_service;
pub mod global_search;
pub mod keybindings;
pub mod lsp;
pub mod macro_service;
pub mod multi_selection;
pub mod notebook_service;
pub mod performance_profiling_service;
pub mod plugins;
pub mod project_scaffolding_service;
pub mod remote_development;
pub mod repl_service;
pub mod session_service;
pub mod snippets_service;
pub mod surround;
pub mod textobjects;
pub mod theme;
pub mod tree_sitter;

// New services for additional features
pub mod code_timelapse_service;
pub mod extension_marketplace_service;
pub mod focus_mode_service;
pub mod gamified_learning_service;
pub mod wasm_ui_service;

// Final services for core features
pub mod indexing_service;
pub mod settings_sync_service;

// New services from feature set 2
pub mod doc_viewer_service;
pub mod local_history_service;
pub mod refactoring_service;
pub mod remote_session_manager_service;
pub mod semantic_search_service;
pub mod snippet_manager_service;
pub mod task_manager_service;
pub mod test_runner_service;
pub mod visual_macro_service;
