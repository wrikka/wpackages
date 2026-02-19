use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

/// Advanced breakpoint
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdvancedBreakpoint {
    pub id: String,
    pub file_path: PathBuf,
    pub line: usize,
    pub column: Option<usize>,
    pub condition: Option<String>,
    pub hit_condition: Option<HitCondition>,
    pub log_message: Option<String>,
    pub enabled: bool,
    pub hit_count: usize,
}

impl AdvancedBreakpoint {
    pub fn new(id: impl Into<String>, file_path: PathBuf, line: usize) -> Self {
        Self {
            id: id.into(),
            file_path,
            line,
            column: None,
            condition: None,
            hit_condition: None,
            log_message: None,
            enabled: true,
            hit_count: 0,
        }
    }

    pub fn with_column(mut self, column: usize) -> Self {
        self.column = Some(column);
        self
    }

    pub fn with_condition(mut self, condition: impl Into<String>) -> Self {
        self.condition = Some(condition.into());
        self
    }

    pub fn with_hit_condition(mut self, condition: HitCondition) -> Self {
        self.hit_condition = Some(condition);
        self
    }

    pub fn with_log_message(mut self, message: impl Into<String>) -> Self {
        self.log_message = Some(message.into());
        self
    }

    pub fn with_enabled(mut self, enabled: bool) -> Self {
        self.enabled = enabled;
        self
    }

    pub fn is_logpoint(&self) -> bool {
        self.log_message.is_some()
    }

    pub fn should_break(&self, variables: &HashMap<String, String>) -> bool {
        if !self.enabled {
            return false;
        }

        // Check condition
        if let Some(condition) = &self.condition {
            if !self.evaluate_condition(condition, variables) {
                return false;
            }
        }

        // Check hit condition
        if let Some(hit_cond) = &self.hit_condition {
            if !hit_cond.should_break(self.hit_count) {
                return false;
            }
        }

        true
    }

    fn evaluate_condition(&self, condition: &str, variables: &HashMap<String, String>) -> bool {
        // Simplified condition evaluation
        for (key, value) in variables {
            if condition.contains(&format!("{} == ", key)) || condition.contains(&format!("{}==", key)) {
                if condition.contains(value) {
                    return true;
                }
            }
        }

        // Default to true if no specific condition found
        true
    }

    pub fn increment_hit(&mut self) {
        self.hit_count += 1;
    }
}

/// Hit condition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HitCondition {
    Equals(usize),
    GreaterThan(usize),
    MultipleOf(usize),
    ModEquals { divisor: usize, remainder: usize },
}

impl HitCondition {
    pub fn should_break(&self, current_count: usize) -> bool {
        match self {
            HitCondition::Equals(n) => current_count == *n,
            HitCondition::GreaterThan(n) => current_count > *n,
            HitCondition::MultipleOf(n) => current_count % n == 0,
            HitCondition::ModEquals { divisor, remainder } => current_count % divisor == *remainder,
        }
    }
}

/// Watch expression
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WatchExpression {
    pub id: String,
    pub expression: String,
    pub enabled: bool,
    pub value: Option<WatchValue>,
}

impl WatchExpression {
    pub fn new(id: impl Into<String>, expression: impl Into<String>) -> Self {
        Self {
            id: id.into(),
            expression: expression.into(),
            enabled: true,
            value: None,
        }
    }

    pub fn with_enabled(mut self, enabled: bool) -> Self {
        self.enabled = enabled;
        self
    }

    pub fn with_value(mut self, value: WatchValue) -> Self {
        self.value = Some(value);
        self
    }

    pub fn update_value(&mut self, value: WatchValue) {
        self.value = Some(value);
    }
}

/// Watch value
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WatchValue {
    pub value: String,
    pub type_name: Option<String>,
    pub children: Vec<WatchValue>,
    pub expanded: bool,
}

impl WatchValue {
    pub fn new(value: impl Into<String>) -> Self {
        Self {
            value: value.into(),
            type_name: None,
            children: Vec::new(),
            expanded: false,
        }
    }

    pub fn with_type(mut self, type_name: impl Into<String>) -> Self {
        self.type_name = Some(type_name.into());
        self
    }

    pub fn with_children(mut self, children: Vec<WatchValue>) -> Self {
        self.children = children;
        self
    }

    pub fn with_expanded(mut self, expanded: bool) -> Self {
        self.expanded = expanded;
        self
    }

    pub fn child_count(&self) -> usize {
        self.children.len()
    }
}

/// Advanced call stack frame
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdvancedStackFrame {
    pub id: String,
    pub function_name: String,
    pub file_path: PathBuf,
    pub line: usize,
    pub column: usize,
    pub module: Option<String>,
    pub variables: HashMap<String, WatchValue>,
    pub is_top_frame: bool,
}

impl AdvancedStackFrame {
    pub fn new(id: impl Into<String>, function_name: impl Into<String>, file_path: PathBuf, line: usize) -> Self {
        Self {
            id: id.into(),
            function_name: function_name.into(),
            file_path,
            line,
            column: 0,
            module: None,
            variables: HashMap::new(),
            is_top_frame: false,
        }
    }

    pub fn with_column(mut self, column: usize) -> Self {
        self.column = column;
        self
    }

    pub fn with_module(mut self, module: impl Into<String>) -> Self {
        self.module = Some(module.into());
        self
    }

    pub fn with_variables(mut self, variables: HashMap<String, WatchValue>) -> Self {
        self.variables = variables;
        self
    }

    pub fn with_is_top_frame(mut self, is_top: bool) -> Self {
        self.is_top_frame = is_top;
        self
    }

    pub fn get_variable(&self, name: &str) -> Option<&WatchValue> {
        self.variables.get(name)
    }

    pub fn variable_count(&self) -> usize {
        self.variables.len()
    }
}

/// Advanced debug session
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdvancedDebugSession {
    pub id: String,
    pub name: String,
    pub state: DebugSessionState,
    pub breakpoints: Vec<AdvancedBreakpoint>,
    pub watch_expressions: Vec<WatchExpression>,
    pub call_stack: Vec<AdvancedStackFrame>,
    pub current_frame: Option<usize>,
    pub threads: Vec<ThreadInfo>,
    pub exception_breakpoints: Vec<ExceptionBreakpoint>,
}

impl AdvancedDebugSession {
    pub fn new(id: impl Into<String>, name: impl Into<String>) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            state: DebugSessionState::Inactive,
            breakpoints: Vec::new(),
            watch_expressions: Vec::new(),
            call_stack: Vec::new(),
            current_frame: None,
            threads: Vec::new(),
            exception_breakpoints: Vec::new(),
        }
    }

    pub fn with_state(mut self, state: DebugSessionState) -> Self {
        self.state = state;
        self
    }

    pub fn add_breakpoint(&mut self, breakpoint: AdvancedBreakpoint) {
        self.breakpoints.push(breakpoint);
    }

    pub fn remove_breakpoint(&mut self, id: &str) -> bool {
        if let Some(pos) = self.breakpoints.iter().position(|b| b.id == id) {
            self.breakpoints.remove(pos);
            true
        } else {
            false
        }
    }

    pub fn get_breakpoint(&self, id: &str) -> Option<&AdvancedBreakpoint> {
        self.breakpoints.iter().find(|b| b.id == id)
    }

    pub fn get_breakpoint_mut(&mut self, id: &str) -> Option<&mut AdvancedBreakpoint> {
        self.breakpoints.iter_mut().find(|b| b.id == id)
    }

    pub fn add_watch(&mut self, watch: WatchExpression) {
        self.watch_expressions.push(watch);
    }

    pub fn remove_watch(&mut self, id: &str) -> bool {
        if let Some(pos) = self.watch_expressions.iter().position(|w| w.id == id) {
            self.watch_expressions.remove(pos);
            true
        } else {
            false
        }
    }

    pub fn get_watch(&self, id: &str) -> Option<&WatchExpression> {
        self.watch_expressions.iter().find(|w| w.id == id)
    }

    pub fn get_watch_mut(&mut self, id: &str) -> Option<&mut WatchExpression> {
        self.watch_expressions.iter_mut().find(|w| w.id == id)
    }

    pub fn set_call_stack(&mut self, stack: Vec<AdvancedStackFrame>) {
        self.call_stack = stack;
        if !self.call_stack.is_empty() {
            self.current_frame = Some(0);
        }
    }

    pub fn get_current_frame(&self) -> Option<&AdvancedStackFrame> {
        self.current_frame.and_then(|idx| self.call_stack.get(idx))
    }

    pub fn get_current_frame_mut(&mut self) -> Option<&mut AdvancedStackFrame> {
        self.current_frame.and_then(|idx| self.call_stack.get_mut(idx))
    }

    pub fn set_current_frame(&mut self, index: usize) {
        if index < self.call_stack.len() {
            self.current_frame = Some(index);
        }
    }

    pub fn add_thread(&mut self, thread: ThreadInfo) {
        self.threads.push(thread);
    }

    pub fn get_thread(&self, id: &str) -> Option<&ThreadInfo> {
        self.threads.iter().find(|t| t.id == id)
    }

    pub fn add_exception_breakpoint(&mut self, exception: ExceptionBreakpoint) {
        self.exception_breakpoints.push(exception);
    }

    pub fn breakpoint_count(&self) -> usize {
        self.breakpoints.len()
    }

    pub fn watch_count(&self) -> usize {
        self.watch_expressions.len()
    }

    pub fn stack_depth(&self) -> usize {
        self.call_stack.len()
    }

    pub fn thread_count(&self) -> usize {
        self.threads.len()
    }
}

/// Debug session state
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum DebugSessionState {
    Inactive,
    Starting,
    Running,
    Paused,
    Stopped,
    Error,
}

/// Thread info
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreadInfo {
    pub id: String,
    pub name: String,
    pub state: ThreadState,
    pub stopped: bool,
    pub stop_reason: Option<String>,
}

impl ThreadInfo {
    pub fn new(id: impl Into<String>, name: impl Into<String>) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            state: ThreadState::Running,
            stopped: false,
            stop_reason: None,
        }
    }

    pub fn with_state(mut self, state: ThreadState) -> Self {
        self.state = state;
        self
    }

    pub fn with_stopped(mut self, stopped: bool, reason: Option<String>) -> Self {
        self.stopped = stopped;
        self.stop_reason = reason;
        self
    }
}

/// Thread state
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ThreadState {
    Running,
    Stopped,
    Stepping,
}

/// Exception breakpoint
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExceptionBreakpoint {
    pub id: String,
    pub exception_type: ExceptionType,
    pub filter: Option<String>,
    pub enabled: bool,
}

impl ExceptionBreakpoint {
    pub fn new(id: impl Into<String>, exception_type: ExceptionType) -> Self {
        Self {
            id: id.into(),
            exception_type,
            filter: None,
            enabled: true,
        }
    }

    pub fn with_filter(mut self, filter: impl Into<String>) -> Self {
        self.filter = Some(filter.into());
        self
    }

    pub fn with_enabled(mut self, enabled: bool) -> Self {
        self.enabled = enabled;
        self
    }

    pub fn should_break(&self, exception: &str) -> bool {
        if !self.enabled {
            return false;
        }

        match &self.exception_type {
            ExceptionType::All => true,
            ExceptionType::Uncaught => true, // Simplified
            ExceptionType::Specific(pattern) => exception.contains(pattern),
        }

        if let Some(filter) = &self.filter {
            exception.contains(filter)
        } else {
            true
        }
    }
}

/// Exception type
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExceptionType {
    All,
    Uncaught,
    Specific(String),
}

/// Step operation
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum StepOperation {
    StepOver,
    StepInto,
    StepOut,
    Continue,
    Pause,
}

/// Debug event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DebugEvent {
    BreakpointHit {
        breakpoint_id: String,
        line: usize,
    },
    ExceptionThrown {
        exception: String,
        message: String,
    },
    ThreadStopped {
        thread_id: String,
        reason: String,
    },
    ThreadStarted {
        thread_id: String,
    },
    ThreadExited {
        thread_id: String,
    },
    ProcessExited {
        exit_code: i32,
    },
    Output {
        category: OutputCategory,
        text: String,
    },
}

impl DebugEvent {
    pub fn category(&self) -> String {
        match self {
            DebugEvent::BreakpointHit { .. } => "breakpoint".to_string(),
            DebugEvent::ExceptionThrown { .. } => "exception".to_string(),
            DebugEvent::ThreadStopped { .. } => "thread".to_string(),
            DebugEvent::ThreadStarted { .. } => "thread".to_string(),
            DebugEvent::ThreadExited { .. } => "thread".to_string(),
            DebugEvent::ProcessExited { .. } => "process".to_string(),
            DebugEvent::Output { category, .. } => format!("{:?}", category),
        }
    }
}

/// Output category
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum OutputCategory {
    Console,
    Stdout,
    Stderr,
    Telemetry,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_advanced_breakpoint() {
        let bp = AdvancedBreakpoint::new("bp1", PathBuf::from("test.rs"), 10)
            .with_column(5)
            .with_condition("x > 0")
            .with_hit_condition(HitCondition::Equals(1))
            .with_enabled(true);

        assert_eq!(bp.id, "bp1");
        assert_eq!(bp.line, 10);
        assert!(bp.enabled);
        assert!(!bp.is_logpoint());
    }

    #[test]
    fn test_logpoint() {
        let bp = AdvancedBreakpoint::new("bp1", PathBuf::from("test.rs"), 10)
            .with_log_message("Value: {x}");

        assert!(bp.is_logpoint());
    }

    #[test]
    fn test_hit_condition() {
        let cond = HitCondition::Equals(5);
        assert!(!cond.should_break(4));
        assert!(cond.should_break(5));

        let cond = HitCondition::MultipleOf(2);
        assert!(cond.should_break(4));
        assert!(!cond.should_break(5));
    }

    #[test]
    fn test_watch_expression() {
        let watch = WatchExpression::new("watch1", "x + y")
            .with_enabled(true)
            .with_value(WatchValue::new("10").with_type("i32"));

        assert_eq!(watch.expression, "x + y");
        assert!(watch.enabled);
        assert!(watch.value.is_some());
    }

    #[test]
    fn test_advanced_debug_session() {
        let mut session = AdvancedDebugSession::new("session1", "Test Session")
            .with_state(DebugSessionState::Paused);

        let bp = AdvancedBreakpoint::new("bp1", PathBuf::from("test.rs"), 10);
        session.add_breakpoint(bp);

        let watch = WatchExpression::new("watch1", "x");
        session.add_watch(watch);

        assert_eq!(session.state, DebugSessionState::Paused);
        assert_eq!(session.breakpoint_count(), 1);
        assert_eq!(session.watch_count(), 1);
    }

    #[test]
    fn test_exception_breakpoint() {
        let bp = ExceptionBreakpoint::new("ex1", ExceptionType::Specific("NullPointerException"))
            .with_enabled(true)
            .with_filter("test");

        assert!(bp.should_break("NullPointerException"));
        assert!(bp.should_break("NullPointerException in test"));
    }
}
