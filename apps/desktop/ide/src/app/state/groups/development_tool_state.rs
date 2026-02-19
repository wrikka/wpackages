//! Development tool feature states

use super::*;

/// Development tool feature states
#[derive(Debug)]
pub struct DevelopmentToolState {
    pub debugging: DebuggingState,
    pub testing: TestingState,
    pub tasks: TasksState,
    pub snippets: SnippetsState,
    pub templates: TemplatesState,
    pub macros: MacrosState,
    pub profiler: ProfilerState,
    pub refactoring: RefactoringState,
    pub git_workflow: GitWorkflowState,
    pub ai_completion: AiCompletionState,
    pub advanced_debugging: AdvancedDebuggingState,
    pub advanced_testing: AdvancedTestingState,
    pub performance: PerformanceState,
}

impl Default for DevelopmentToolState {
    fn default() -> Self {
        Self {
            debugging: DebuggingState::default(),
            testing: TestingState::default(),
            tasks: TasksState::default(),
            snippets: SnippetsState::default(),
            templates: TemplatesState::default(),
            macros: MacrosState::default(),
            profiler: ProfilerState::default(),
            refactoring: RefactoringState::default(),
            git_workflow: GitWorkflowState::default(),
            ai_completion: AiCompletionState::default(),
            advanced_debugging: AdvancedDebuggingState::default(),
            advanced_testing: AdvancedTestingState::default(),
            performance: PerformanceState::default(),
        }
    }
}
