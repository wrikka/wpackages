use crate::components::{
    // All UI Components
    // Original
    code_outline::CodeOutline,
    // Feature Set 1
    // Feature Set 2
    diagram_tool_ui::DiagramToolUi,
    doc_viewer_ui::DocViewerUi,
    editor::EditorState,
    file_explorer::FileExplorer,
    local_history_ui::LocalHistoryUi,
    markdown_preview::MarkdownPreview,
    plugin_marketplace::PluginMarketplace,
    refactoring_ui::RefactoringUi,
    remote_session_manager_ui::RemoteSessionManagerUi,
    semantic_search_ui::SemanticSearchUi,
    snippet_manager_ui::SnippetManagerUi,
    task_manager_ui::TaskManagerUi,
    terminal::TerminalComponent,
    test_runner_ui::TestRunnerUi,
    visual_macro_editor::VisualMacroEditor,
};
use crate::config::AppConfig;
use crate::error::Result;
use crate::modules::{
    api_client, database_explorer, debugger, git, global_search, notebook_viewer,
    performance_profiler, project_scaffolding, repl,
};
use crate::services::{
    // All Services
    // Original
    ai_service::AiService,
    api_client_service::ApiClientService,
    collaboration::CollaborationService,
    database_explorer_service::DatabaseExplorerService,
    doc_viewer_service::DocViewerService,
    // Feature Set 1
    focus_mode_service::FocusModeService,
    gamified_learning_service::GamifiedLearningService,
    indexing_service::IndexingService,
    keybindings::KeyBindings,
    local_history_service::LocalHistoryService,
    macro_service::MacroService,
    notebook_service::NotebookService,
    performance_profiling_service::PerformanceProfilingService,
    project_scaffolding_service::ProjectScaffoldingService,
    refactoring_service::RefactoringService,
    remote_development::RemoteDevelopmentService,
    remote_session_manager_service::RemoteSessionManagerService,
    semantic_search_service::SemanticSearchService,
    session_service::SessionService,
    settings_sync_service::SettingsSyncService,
    snippet_manager_service::SnippetManagerService,
    snippets_service::SnippetsService,
    task_manager_service::TaskManagerService,
    test_runner_service::TestRunnerService,
    visual_macro_service::VisualMacroService,
    wasm_ui_service::WasmUiService,
};

pub struct Components {
    pub code_outline: CodeOutline,
    pub editor_state: EditorState,
    pub file_explorer: FileExplorer,
    pub markdown_preview: MarkdownPreview,
    pub plugin_marketplace: PluginMarketplace,
    pub terminal: TerminalComponent,
    // New Components
    pub api_client: api_client::ApiClientComponent,
    pub database_explorer: database_explorer::DatabaseExplorerComponent,
    pub debugger: debugger::DebuggerComponent,
    pub global_search_ui: global_search::GlobalSearchUiComponent,
    pub notebook_viewer: notebook_viewer::NotebookViewerComponent,
    pub performance_profiler: performance_profiler::PerformanceProfilerComponent,
    pub project_scaffolding: project_scaffolding::ProjectScaffoldingComponent,
    pub repl: repl::ReplComponent,
    // Feature set 2 UI
    pub diagram_tool_ui: DiagramToolUi,
    pub doc_viewer_ui: DocViewerUi,
    pub git_ui: git::GitUi,
    pub local_history_ui: LocalHistoryUi,
    pub refactoring_ui: RefactoringUi,
    pub remote_session_manager_ui: RemoteSessionManagerUi,
    pub semantic_search_ui: SemanticSearchUi,
    pub snippet_manager_ui: SnippetManagerUi,
    pub task_manager_ui: TaskManagerUi,
    pub test_runner_ui: TestRunnerUi,
    pub visual_macro_editor: VisualMacroEditor,
}

pub struct Services {
    // Original
    pub ai: Option<AiService>,
    pub collaboration: CollaborationService,
    pub keybindings: KeyBindings,
    pub macros: MacroService,
    pub snippets: SnippetsService,
    // Feature Set 1
    pub api_client: api_client::ApiClientService,
    pub db_explorer: database_explorer::DatabaseExplorerService,
    pub debugger: debugger::DebuggerService,
    pub focus_mode: FocusModeService,
    pub gamified_learning: GamifiedLearningService,
    pub global_search: global_search::GlobalSearchService,
    pub indexer: IndexingService,
    pub notebook: notebook_viewer::NotebookService,
    pub profiler: performance_profiler::PerformanceProfilingService,
    pub scaffolder: project_scaffolding::ProjectScaffoldingService,
    // pub remote_dev: RemoteDevelopmentService, // Needs async init
    pub repl: repl::ReplService,
    pub session_manager: SessionService,
    // pub settings_sync: SettingsSyncService, // Needs init with user id
    pub wasm_ui: WasmUiService,
    // Feature Set 2
    pub git: git::GitService,
    pub doc_viewer: DocViewerService,
    pub local_history: LocalHistoryService,
    pub refactoring: RefactoringService,
    pub remote_session_manager: RemoteSessionManagerService,
    pub semantic_search: SemanticSearchService,
    pub snippet_manager: SnippetManagerService,
    pub task_manager: TaskManagerService,
    pub test_runner: TestRunnerService,
    pub visual_macro_editor: VisualMacroService,
}

pub struct App {
    pub config: AppConfig,
    pub should_quit: bool,
    pub zen_mode: bool,
    pub components: Components,
    pub services: Services,
}

impl App {
    pub fn new(config: AppConfig) -> Result<Self> {
        let components = Components {
            code_outline: CodeOutline::default(),
            editor_state: EditorState::new(&config)?,
            file_explorer: FileExplorer::default(),
            markdown_preview: MarkdownPreview::default(),
            plugin_marketplace: PluginMarketplace::default(),
            terminal: TerminalComponent::new()?,
            // New Components
            api_client: api_client::ApiClientComponent::default(),
            database_explorer: database_explorer::DatabaseExplorerComponent::default(),
            debugger: debugger::DebuggerComponent::default(),
            global_search_ui: global_search::GlobalSearchUiComponent::default(),
            notebook_viewer: notebook_viewer::NotebookViewerComponent::default(),
            performance_profiler: performance_profiler::PerformanceProfilerComponent::default(),
            project_scaffolding: project_scaffolding::ProjectScaffoldingComponent::default(),
            repl: repl::ReplComponent::default(),
            // Feature set 2 UI
            diagram_tool_ui: DiagramToolUi::default(),
            doc_viewer_ui: DocViewerUi::default(),
            git_ui: git::GitUi::default(),
            local_history_ui: LocalHistoryUi::default(),
            refactoring_ui: RefactoringUi::default(),
            remote_session_manager_ui: RemoteSessionManagerUi::default(),
            semantic_search_ui: SemanticSearchUi::default(),
            snippet_manager_ui: SnippetManagerUi::default(),
            task_manager_ui: TaskManagerUi::default(),
            test_runner_ui: TestRunnerUi::default(),
            visual_macro_editor: VisualMacroEditor::default(),
        };

        let services = Services {
            // Original
            ai: config.ai.as_ref().map(|ai_config| {
                AiService::new(ai_config.api_key.clone(), ai_config.endpoint.clone())
            }),
            collaboration: CollaborationService::new(),
            keybindings: KeyBindings::from_config(&config.keybindings),
            macros: MacroService::default(),
            snippets: SnippetsService::default(),
            // Feature Set 1
            api_client: ApiClientService::default(),
            db_explorer: DatabaseExplorerService::default(),
            debugger: debugger::DebuggerService::default(),
            focus_mode: FocusModeService::default(),
            gamified_learning: GamifiedLearningService::default(),
            global_search: global_search::GlobalSearchService {},
            indexer: IndexingService::default(),
            notebook: NotebookService {},
            profiler: PerformanceProfilingService::default(),
            repl: repl::ReplService::default(),
            scaffolder: ProjectScaffoldingService::default(),
            session_manager: SessionService {},
            wasm_ui: WasmUiService::default(),
            // Feature Set 2
            git: git::GitService::default(), // Placeholder, needs proper initialization
            doc_viewer: DocViewerService::default(),
            local_history: LocalHistoryService::default(),
            refactoring: RefactoringService::default(),
            remote_session_manager: RemoteSessionManagerService::default(),
            semantic_search: SemanticSearchService::default(),
            snippet_manager: SnippetManagerService::default(),
            task_manager: TaskManagerService::default(),
            test_runner: TestRunnerService::default(),
            visual_macro_editor: VisualMacroService::default(),
        };

        Ok(Self {
            config,
            should_quit: false,
            zen_mode: false,
            components,
            services,
        })
    }

    // For now, this is a placeholder run loop.
    // A proper implementation would involve a TUI backend and an event loop.
    pub async fn run(&mut self) -> Result<()> {
        tracing::info!("Running rvim application");
        // In a real app, you would have an event loop here.
        // For now, we'll just demonstrate that the components exist.
        Ok(())
    }

    pub fn on_key(&mut self, key: crossterm::event::KeyEvent) {
        // This is a placeholder for key handling logic
        // In a real app, you would match on the key and update state accordingly
        if let crossterm::event::KeyCode::Char('q') = key.code {
            self.should_quit = true;
        }
    }

    pub fn toggle_zen_mode(&mut self) {
        self.zen_mode = !self.zen_mode;
    }
}
