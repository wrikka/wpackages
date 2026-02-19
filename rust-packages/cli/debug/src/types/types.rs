use lsp_types::{Position, Range, Url};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Debug session state
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum DebugSessionState {
    /// Session is starting
    Starting,
    /// Session is running
    Running,
    /// Session is paused
    Paused,
    /// Session is stopped
    Stopped,
    /// Session has an error
    Error,
}

/// Debug configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DebugConfig {
    pub name: String,
    pub adapter_type: String,
    pub program: String,
    pub args: Vec<String>,
    pub cwd: Option<String>,
    pub env: HashMap<String, String>,
    pub stop_on_entry: bool,
    pub console: DebugConsole,
}

impl DebugConfig {
    pub fn new(name: impl Into<String>, adapter_type: impl Into<String>, program: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            adapter_type: adapter_type.into(),
            program: program.into(),
            args: Vec::new(),
            cwd: None,
            env: HashMap::new(),
            stop_on_entry: false,
            console: DebugConsole::IntegratedTerminal,
        }
    }

    pub fn with_args(mut self, args: Vec<String>) -> Self {
        self.args = args;
        self
    }

    pub fn with_cwd(mut self, cwd: impl Into<String>) -> Self {
        self.cwd = Some(cwd.into());
        self
    }

    pub fn with_env(mut self, env: HashMap<String, String>) -> Self {
        self.env = env;
        self
    }

    pub fn with_stop_on_entry(mut self, stop: bool) -> Self {
        self.stop_on_entry = stop;
        self
    }

    pub fn with_console(mut self, console: DebugConsole) -> Self {
        self.console = console;
        self
    }
}

/// Debug console type
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum DebugConsole {
    InternalConsole,
    IntegratedTerminal,
    ExternalTerminal,
}

/// Debug session
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DebugSession {
    pub id: String,
    pub config: DebugConfig,
    pub state: DebugSessionState,
    pub pid: Option<u32>,
    pub start_time: chrono::DateTime<chrono::Utc>,
    pub end_time: Option<chrono::DateTime<chrono::Utc>>,
}

impl DebugSession {
    pub fn new(config: DebugConfig) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            config,
            state: DebugSessionState::Starting,
            pid: None,
            start_time: chrono::Utc::now(),
            end_time: None,
        }
    }

    pub fn is_running(&self) -> bool {
        matches!(self.state, DebugSessionState::Running | DebugSessionState::Paused)
    }

    pub fn is_paused(&self) -> bool {
        self.state == DebugSessionState::Paused
    }

    pub fn duration(&self) -> Option<chrono::Duration> {
        let end = self.end_time.unwrap_or_else(|| chrono::Utc::now());
        Some(end - self.start_time)
    }
}

/// Thread info
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Thread {
    pub id: i64,
    pub name: String,
    pub stopped: bool,
}

/// Source location
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SourceLocation {
    pub uri: Url,
    pub line: usize,
    pub column: usize,
}

impl SourceLocation {
    pub fn new(uri: Url, line: usize, column: usize) -> Self {
        Self { uri, line, column }
    }

    pub fn to_position(&self) -> Position {
        Position::new(self.line, self.column)
    }

    pub fn to_range(&self) -> Range {
        Range::new(self.to_position(), self.to_position())
    }
}

/// Step mode
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum StepMode {
    StepOver,
    StepInto,
    StepOut,
    Continue,
    Pause,
}

/// Evaluation result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvaluationResult {
    pub value: String,
    pub type_name: Option<String>,
    pub variables_reference: Option<i64>,
    pub named_variables: Option<i64>,
    pub indexed_variables: Option<i64>,
}

impl EvaluationResult {
    pub fn new(value: impl Into<String>) -> Self {
        Self {
            value: value.into(),
            type_name: None,
            variables_reference: None,
            named_variables: None,
            indexed_variables: None,
        }
    }

    pub fn with_type(mut self, type_name: impl Into<String>) -> Self {
        self.type_name = Some(type_name.into());
        self
    }

    pub fn with_variables_reference(mut self, ref_id: i64) -> Self {
        self.variables_reference = Some(ref_id);
        self
    }
}

/// Scope
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Scope {
    pub name: String,
    pub variables_reference: i64,
    pub named_variables: i64,
    pub indexed_variables: i64,
    pub expensive: bool,
}

/// Output event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OutputEvent {
    pub category: String,
    pub output: String,
    pub variables_reference: Option<i64>,
    pub source: Option<SourceLocation>,
    pub line: Option<usize>,
    pub column: Option<usize>,
}

impl OutputEvent {
    pub fn new(category: impl Into<String>, output: impl Into<String>) -> Self {
        Self {
            category: category.into(),
            output: output.into(),
            variables_reference: None,
            source: None,
            line: None,
            column: None,
        }
    }

    pub fn with_source(mut self, uri: Url, line: usize, column: usize) -> Self {
        self.source = Some(SourceLocation::new(uri, line, column));
        self.line = Some(line);
        self.column = Some(column);
        self
    }
}

/// Process info
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub start_time: chrono::DateTime<chrono::Utc>,
}

/// Capabilities
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DebugCapabilities {
    pub supports_configuration_done_request: bool,
    pub supports_function_breakpoints: bool,
    pub supports_conditional_breakpoints: bool,
    pub supports_hit_conditional_breakpoints: bool,
    pub supports_evaluate_for_hovers: bool,
    pub supports_step_back: bool,
    pub supports_set_variable: bool,
    pub supports_restart_frame: bool,
    pub supports_goto_targets_request: bool,
    pub supports_step_in_targets_request: bool,
    pub supports_completions_request: bool,
    pub supports_modules_request: bool,
    pub supports_terminate_request: bool,
    pub supports_data_breakpoints: bool,
    pub supports_read_memory_request: bool,
    pub supports_write_memory_request: bool,
    pub supports_disassemble_request: bool,
    pub supports_cancel_request: bool,
    pub supports_clipboard_context: bool,
    pub supports_stepping_granularity: bool,
    pub supports_instruction_breakpoints: bool,
}

impl Default for DebugCapabilities {
    fn default() -> Self {
        Self {
            supports_configuration_done_request: false,
            supports_function_breakpoints: false,
            supports_conditional_breakpoints: false,
            supports_hit_conditional_breakpoints: false,
            supports_evaluate_for_hovers: false,
            supports_step_back: false,
            supports_set_variable: false,
            supports_restart_frame: false,
            supports_goto_targets_request: false,
            supports_step_in_targets_request: false,
            supports_completions_request: false,
            supports_modules_request: false,
            supports_terminate_request: false,
            supports_data_breakpoints: false,
            supports_read_memory_request: false,
            supports_write_memory_request: false,
            supports_disassemble_request: false,
            supports_cancel_request: false,
            supports_clipboard_context: false,
            supports_stepping_granularity: false,
            supports_instruction_breakpoints: false,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_debug_config() {
        let config = DebugConfig::new("test", "lldb", "./target/debug/test")
            .with_args(vec!["--test".to_string()])
            .with_stop_on_entry(true);

        assert_eq!(config.name, "test");
        assert_eq!(config.adapter_type, "lldb");
        assert_eq!(config.program, "./target/debug/test");
        assert_eq!(config.args.len(), 1);
        assert!(config.stop_on_entry);
    }

    #[test]
    fn test_source_location() {
        let uri = Url::parse("file:///test.rs").unwrap();
        let loc = SourceLocation::new(uri, 10, 5);

        assert_eq!(loc.line, 10);
        assert_eq!(loc.column, 5);

        let pos = loc.to_position();
        assert_eq!(pos.line, 10);
        assert_eq!(pos.character, 5);
    }

    #[test]
    fn test_evaluation_result() {
        let result = EvaluationResult::new("42")
            .with_type("i32")
            .with_variables_reference(100);

        assert_eq!(result.value, "42");
        assert_eq!(result.type_name, Some("i32".to_string()));
        assert_eq!(result.variables_reference, Some(100));
    }
}
