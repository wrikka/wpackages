#[derive(Debug, Clone, Default)]
pub struct AdvancedDebuggingClient {
    pub sessions: Vec<AdvancedDebugSession>,
}

impl AdvancedDebuggingClient {
    pub fn new() -> Self {
        Self {
            sessions: Vec::new(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct AdvancedDebugSession {
    pub id: String,
    pub name: String,
    pub state: DebugSessionState,
    pub breakpoints: Vec<AdvancedBreakpoint>,
    pub watch_expressions: Vec<WatchExpression>,
    pub call_stack: Vec<StackFrame>,
}

impl AdvancedDebugSession {
    pub fn new(id: String, name: String) -> Self {
        Self {
            id,
            name,
            state: DebugSessionState::Inactive,
            breakpoints: Vec::new(),
            watch_expressions: Vec::new(),
            call_stack: Vec::new(),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DebugSessionState {
    Inactive,
    Starting,
    Running,
    Paused,
    Stopped,
    Error,
}

#[derive(Debug, Clone)]
pub struct AdvancedBreakpoint {
    pub id: String,
    pub file: String,
    pub line: usize,
    pub condition: Option<String>,
    pub enabled: bool,
}

#[derive(Debug, Clone)]
pub struct WatchExpression {
    pub id: String,
    pub expression: String,
    pub value: Option<String>,
}

#[derive(Debug, Clone)]
pub struct StackFrame {
    pub id: String,
    pub function_name: String,
    pub file: String,
    pub line: usize,
}
