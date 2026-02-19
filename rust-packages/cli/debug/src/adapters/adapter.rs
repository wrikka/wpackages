use crate::error::{DebugError, DebugResult};
use crate::types::{DebugCapabilities, DebugConfig, DebugSession, DebugSessionState, OutputEvent, ProcessInfo, SourceLocation, StepMode, Thread};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::process::Command;
use std::sync::{Arc, Mutex};
use tokio::process::Child;
use tracing::{debug, info, warn};

/// Debug adapter trait
#[async_trait]
pub trait DebugAdapter: Send + Sync {
    /// Launch the debug adapter
    async fn launch(&mut self, config: DebugConfig) -> DebugResult<DebugSession>;

    /// Attach to a running process
    async fn attach(&mut self, pid: u32, config: DebugConfig) -> DebugResult<DebugSession>;

    /// Disconnect from the debug session
    async fn disconnect(&mut self) -> DebugResult<()>;

    /// Terminate the debug session
    async fn terminate(&mut self) -> DebugResult<()>;

    /// Restart the debug session
    async fn restart(&mut self) -> DebugResult<()>;

    /// Set breakpoints
    async fn set_breakpoints(&mut self, breakpoints: Vec<crate::breakpoint::Breakpoint>) -> DebugResult<Vec<crate::breakpoint::Breakpoint>>;

    /// Set exception breakpoints
    async fn set_exception_breakpoints(&mut self, filters: Vec<ExceptionFilter>) -> DebugResult<Vec<ExceptionBreakpoint>>;

    /// Continue execution
    async fn continue_execution(&mut self) -> DebugResult<()>;

    /// Pause execution
    async fn pause(&mut self) -> DebugResult<()>;

    /// Step execution
    async fn step(&mut self, mode: StepMode) -> DebugResult<()>;

    /// Get threads
    async fn get_threads(&self) -> DebugResult<Vec<Thread>>;

    /// Get stack trace
    async fn get_stack_trace(&self, thread_id: i64, start_frame: i64, levels: i64) -> DebugResult<Vec<crate::stack::StackFrame>>;

    /// Get scopes
    async fn get_scopes(&self, frame_id: i64) -> DebugResult<Vec<crate::types::Scope>>;

    /// Get variables
    async fn get_variables(&self, variables_reference: i64) -> DebugResult<Vec<crate::variables::Variable>>;

    /// Evaluate expression
    async fn evaluate(&self, expression: &str, frame_id: i64, context: EvaluateContext) -> DebugResult<crate::types::EvaluationResult>;

    /// Set variable value
    async fn set_variable(&self, variables_reference: i64, name: &str, value: &str) -> DebugResult<()>;

    /// Get source
    async fn get_source(&self, source_reference: i64) -> DebugResult<String>;

    /// Get capabilities
    async fn get_capabilities(&self) -> DebugResult<DebugCapabilities>;

    /// Get session state
    fn get_session_state(&self) -> DebugSessionState;

    /// Get session
    fn get_session(&self) -> Option<DebugSession>;

    /// Is connected
    fn is_connected(&self) -> bool;
}

/// Debug adapter factory
pub struct DebugAdapterFactory;

impl DebugAdapterFactory {
    pub fn create(adapter_type: &str) -> DebugResult<Box<dyn DebugAdapter>> {
        match adapter_type {
            "lldb" => Ok(Box::new(LldbAdapter::new())),
            "gdb" => Ok(Box::new(GdbAdapter::new())),
            "node" => Ok(Box::new(NodeAdapter::new())),
            "python" => Ok(Box::new(PythonAdapter::new())),
            _ => Err(DebugError::Other(anyhow::any!("Unknown adapter type: {}", adapter_type))),
        }
    }
}

/// LLDB adapter
pub struct LldbAdapter {
    session: Option<DebugSession>,
    process: Option<Child>,
    connected: bool,
    capabilities: DebugCapabilities,
}

impl LldbAdapter {
    pub fn new() -> Self {
        Self {
            session: None,
            process: None,
            connected: false,
            capabilities: DebugCapabilities::default(),
        }
    }
}

#[async_trait]
impl DebugAdapter for LldbAdapter {
    async fn launch(&mut self, config: DebugConfig) -> DebugResult<DebugSession> {
        info!("Launching with LLDB: {:?}", config);

        // Create debug session
        let mut session = DebugSession::new(config.clone());
        session.state = DebugSessionState::Starting;

        // Launch the process
        let mut child = Command::new("lldb")
            .arg("--")
            .arg(&config.program)
            .args(&config.args)
            .spawn()
            .map_err(|e| DebugError::LaunchFailed(e.to_string()))?;

        session.pid = Some(child.id() as u32);
        self.process = Some(child);
        session.state = DebugSessionState::Running;

        self.session = Some(session);
        self.connected = true;

        Ok(self.session.as_ref().unwrap().clone())
    }

    async fn attach(&mut self, pid: u32, config: DebugConfig) -> DebugResult<DebugSession> {
        info!("Attaching to process {} with LLDB", pid);

        let mut session = DebugSession::new(config.clone());
        session.state = DebugSessionState::Starting;
        session.pid = Some(pid);
        session.state = DebugSessionState::Running;

        self.session = Some(session);
        self.connected = true;

        Ok(self.session.as_ref().unwrap().clone())
    }

    async fn disconnect(&mut self) -> DebugResult<()> {
        if let Some(mut session) = self.session.take() {
            session.state = DebugSessionState::Stopped;
            session.end_time = Some(chrono::Utc::now());
        }
        self.connected = false;
        Ok(())
    }

    async fn terminate(&mut self) -> DebugResult<()> {
        if let Some(mut child) = self.process.take() {
            child.kill().await.map_err(|e| DebugError::Other(e.to_string()))?;
        }
        self.disconnect().await
    }

    async fn restart(&mut self) -> DebugResult<()> {
        let config = self.session.as_ref().unwrap().config.clone();
        self.terminate().await?;
        self.launch(config).await?;
        Ok(())
    }

    async fn set_breakpoints(&mut self, breakpoints: Vec<crate::breakpoint::Breakpoint>) -> DebugResult<Vec<crate::breakpoint::Breakpoint>> {
        debug!("Setting {} breakpoints", breakpoints.len());
        Ok(breakpoints)
    }

    async fn set_exception_breakpoints(&mut self, filters: Vec<ExceptionFilter>) -> DebugResult<Vec<ExceptionBreakpoint>> {
        debug!("Setting exception breakpoints: {:?}", filters);
        Ok(filters.iter().map(|f| ExceptionBreakpoint {
            filter_id: f.clone(),
            verified: true,
        }).collect())
    }

    async fn continue_execution(&mut self) -> DebugResult<()> {
        if let Some(session) = self.session.as_mut() {
            session.state = DebugSessionState::Running;
        }
        debug!("Continuing execution");
        Ok(())
    }

    async fn pause(&mut self) -> DebugResult<()> {
        if let Some(session) = self.session.as_mut() {
            session.state = DebugSessionState::Paused;
        }
        debug!("Pausing execution");
        Ok(())
    }

    async fn step(&mut self, mode: StepMode) -> DebugResult<()> {
        debug!("Stepping: {:?}", mode);
        Ok(())
    }

    async fn get_threads(&self) -> DebugResult<Vec<Thread>> {
        Ok(vec![Thread {
            id: 1,
            name: "main".to_string(),
            stopped: self.session.as_ref().map(|s| s.state == DebugSessionState::Paused).unwrap_or(false),
        }])
    }

    async fn get_stack_trace(&self, thread_id: i64, start_frame: i64, levels: i64) -> DebugResult<Vec<crate::stack::StackFrame>> {
        debug!("Getting stack trace for thread {}, start {}, levels {}", thread_id, start_frame, levels);
        Ok(Vec::new())
    }

    async fn get_scopes(&self, frame_id: i64) -> DebugResult<Vec<crate::types::Scope>> {
        debug!("Getting scopes for frame {}", frame_id);
        Ok(Vec::new())
    }

    async fn get_variables(&self, variables_reference: i64) -> DebugResult<Vec<crate::variables::Variable>> {
        debug!("Getting variables for reference {}", variables_reference);
        Ok(Vec::new())
    }

    async fn evaluate(&self, expression: &str, frame_id: i64, context: EvaluateContext) -> DebugResult<crate::types::EvaluationResult> {
        debug!("Evaluating expression '{}' in frame {} with context {:?}", expression, frame_id, context);
        Ok(crate::types::EvaluationResult::new(format!("<evaluated: {}>", expression)))
    }

    async fn set_variable(&self, variables_reference: i64, name: &str, value: &str) -> DebugResult<()> {
        debug!("Setting variable {} = {} in reference {}", name, value, variables_reference);
        Ok(())
    }

    async fn get_source(&self, source_reference: i64) -> DebugResult<String> {
        debug!("Getting source for reference {}", source_reference);
        Ok(String::new())
    }

    async fn get_capabilities(&self) -> DebugResult<DebugCapabilities> {
        Ok(self.capabilities.clone())
    }

    fn get_session_state(&self) -> DebugSessionState {
        self.session.as_ref().map(|s| s.state).unwrap_or(DebugSessionState::Stopped)
    }

    fn get_session(&self) -> Option<DebugSession> {
        self.session.clone()
    }

    fn is_connected(&self) -> bool {
        self.connected
    }
}

/// GDB adapter
pub struct GdbAdapter {
    session: Option<DebugSession>,
    connected: bool,
    capabilities: DebugCapabilities,
}

impl GdbAdapter {
    pub fn new() -> Self {
        Self {
            session: None,
            connected: false,
            capabilities: DebugCapabilities::default(),
        }
    }
}

#[async_trait]
impl DebugAdapter for GdbAdapter {
    async fn launch(&mut self, config: DebugConfig) -> DebugResult<DebugSession> {
        info!("Launching with GDB: {:?}", config);
        let session = DebugSession::new(config);
        self.session = Some(session);
        self.connected = true;
        Ok(self.session.as_ref().unwrap().clone())
    }

    async fn attach(&mut self, pid: u32, config: DebugConfig) -> DebugResult<DebugSession> {
        info!("Attaching to process {} with GDB", pid);
        let session = DebugSession::new(config);
        self.session = Some(session);
        self.connected = true;
        Ok(self.session.as_ref().unwrap().clone())
    }

    async fn disconnect(&mut self) -> DebugResult<()> {
        self.session = None;
        self.connected = false;
        Ok(())
    }

    async fn terminate(&mut self) -> DebugResult<()> {
        self.disconnect().await
    }

    async fn restart(&mut self) -> DebugResult<()> {
        let config = self.session.as_ref().unwrap().config.clone();
        self.terminate().await?;
        self.launch(config).await?;
        Ok(())
    }

    async fn set_breakpoints(&mut self, breakpoints: Vec<crate::breakpoint::Breakpoint>) -> DebugResult<Vec<crate::breakpoint::Breakpoint>> {
        Ok(breakpoints)
    }

    async fn set_exception_breakpoints(&mut self, filters: Vec<ExceptionFilter>) -> DebugResult<Vec<ExceptionBreakpoint>> {
        Ok(filters.iter().map(|f| ExceptionBreakpoint {
            filter_id: f.clone(),
            verified: true,
        }).collect())
    }

    async fn continue_execution(&mut self) -> DebugResult<()> {
        Ok(())
    }

    async fn pause(&mut self) -> DebugResult<()> {
        Ok(())
    }

    async fn step(&mut self, mode: StepMode) -> DebugResult<()> {
        Ok(())
    }

    async fn get_threads(&self) -> DebugResult<Vec<Thread>> {
        Ok(Vec::new())
    }

    async fn get_stack_trace(&self, thread_id: i64, start_frame: i64, levels: i64) -> DebugResult<Vec<crate::stack::StackFrame>> {
        Ok(Vec::new())
    }

    async fn get_scopes(&self, frame_id: i64) -> DebugResult<Vec<crate::types::Scope>> {
        Ok(Vec::new())
    }

    async fn get_variables(&self, variables_reference: i64) -> DebugResult<Vec<crate::variables::Variable>> {
        Ok(Vec::new())
    }

    async fn evaluate(&self, expression: &str, frame_id: i64, context: EvaluateContext) -> DebugResult<crate::types::EvaluationResult> {
        Ok(crate::types::EvaluationResult::new(format!("<evaluated: {}>", expression)))
    }

    async fn set_variable(&self, variables_reference: i64, name: &str, value: &str) -> DebugResult<()> {
        Ok(())
    }

    async fn get_source(&self, source_reference: i64) -> DebugResult<String> {
        Ok(String::new())
    }

    async fn get_capabilities(&self) -> DebugResult<DebugCapabilities> {
        Ok(self.capabilities.clone())
    }

    fn get_session_state(&self) -> DebugSessionState {
        self.session.as_ref().map(|s| s.state).unwrap_or(DebugSessionState::Stopped)
    }

    fn get_session(&self) -> Option<DebugSession> {
        self.session.clone()
    }

    fn is_connected(&self) -> bool {
        self.connected
    }
}

/// Node.js adapter
pub struct NodeAdapter {
    session: Option<DebugSession>,
    connected: bool,
    capabilities: DebugCapabilities,
}

impl NodeAdapter {
    pub fn new() -> Self {
        Self {
            session: None,
            connected: false,
            capabilities: DebugCapabilities::default(),
        }
    }
}

#[async_trait]
impl DebugAdapter for NodeAdapter {
    async fn launch(&mut self, config: DebugConfig) -> DebugResult<DebugSession> {
        info!("Launching with Node.js: {:?}", config);
        let session = DebugSession::new(config);
        self.session = Some(session);
        self.connected = true;
        Ok(self.session.as_ref().unwrap().clone())
    }

    async fn attach(&mut self, pid: u32, config: DebugConfig) -> DebugResult<DebugSession> {
        info!("Attaching to process {} with Node.js", pid);
        let session = DebugSession::new(config);
        self.session = Some(session);
        self.connected = true;
        Ok(self.session.as_ref().unwrap().clone())
    }

    async fn disconnect(&mut self) -> DebugResult<()> {
        self.session = None;
        self.connected = false;
        Ok(())
    }

    async fn terminate(&mut self) -> DebugResult<()> {
        self.disconnect().await
    }

    async fn restart(&mut self) -> DebugResult<()> {
        let config = self.session.as_ref().unwrap().config.clone();
        self.terminate().await?;
        self.launch(config).await?;
        Ok(())
    }

    async fn set_breakpoints(&mut self, breakpoints: Vec<crate::breakpoint::Breakpoint>) -> DebugResult<Vec<crate::breakpoint::Breakpoint>> {
        Ok(breakpoints)
    }

    async fn set_exception_breakpoints(&mut self, filters: Vec<ExceptionFilter>) -> DebugResult<Vec<ExceptionBreakpoint>> {
        Ok(filters.iter().map(|f| ExceptionBreakpoint {
            filter_id: f.clone(),
            verified: true,
        }).collect())
    }

    async fn continue_execution(&mut self) -> DebugResult<()> {
        Ok(())
    }

    async fn pause(&mut self) -> DebugResult<()> {
        Ok(())
    }

    async fn step(&mut self, mode: StepMode) -> DebugResult<()> {
        Ok(())
    }

    async fn get_threads(&self) -> DebugResult<Vec<Thread>> {
        Ok(Vec::new())
    }

    async fn get_stack_trace(&self, thread_id: i64, start_frame: i64, levels: i64) -> DebugResult<Vec<crate::stack::StackFrame>> {
        Ok(Vec::new())
    }

    async fn get_scopes(&self, frame_id: i64) -> DebugResult<Vec<crate::types::Scope>> {
        Ok(Vec::new())
    }

    async fn get_variables(&self, variables_reference: i64) -> DebugResult<Vec<crate::variables::Variable>> {
        Ok(Vec::new())
    }

    async fn evaluate(&self, expression: &str, frame_id: i64, context: EvaluateContext) -> DebugResult<crate::types::EvaluationResult> {
        Ok(crate::types::EvaluationResult::new(format!("<evaluated: {}>", expression)))
    }

    async fn set_variable(&self, variables_reference: i64, name: &str, value: &str) -> DebugResult<()> {
        Ok(())
    }

    async fn get_source(&self, source_reference: i64) -> DebugResult<String> {
        Ok(String::new())
    }

    async fn get_capabilities(&self) -> DebugResult<DebugCapabilities> {
        Ok(self.capabilities.clone())
    }

    fn get_session_state(&self) -> DebugSessionState {
        self.session.as_ref().map(|s| s.state).unwrap_or(DebugSessionState::Stopped)
    }

    fn get_session(&self) -> Option<DebugSession> {
        self.session.clone()
    }

    fn is_connected(&self) -> bool {
        self.connected
    }
}

/// Python adapter
pub struct PythonAdapter {
    session: Option<DebugSession>,
    connected: bool,
    capabilities: DebugCapabilities,
}

impl PythonAdapter {
    pub fn new() -> Self {
        Self {
            session: None,
            connected: false,
            capabilities: DebugCapabilities::default(),
        }
    }
}

#[async_trait]
impl DebugAdapter for PythonAdapter {
    async fn launch(&mut self, config: DebugConfig) -> DebugResult<DebugSession> {
        info!("Launching with Python: {:?}", config);
        let session = DebugSession::new(config);
        self.session = Some(session);
        self.connected = true;
        Ok(self.session.as_ref().unwrap().clone())
    }

    async fn attach(&mut self, pid: u32, config: DebugConfig) -> DebugResult<DebugSession> {
        info!("Attaching to process {} with Python", pid);
        let session = DebugSession::new(config);
        self.session = Some(session);
        self.connected = true;
        Ok(self.session.as_ref().unwrap().clone())
    }

    async fn disconnect(&mut self) -> DebugResult<()> {
        self.session = None;
        self.connected = false;
        Ok(())
    }

    async fn terminate(&mut self) -> DebugResult<()> {
        self.disconnect().await
    }

    async fn restart(&mut self) -> DebugResult<()> {
        let config = self.session.as_ref().unwrap().config.clone();
        self.terminate().await?;
        self.launch(config).await?;
        Ok(())
    }

    async fn set_breakpoints(&mut self, breakpoints: Vec<crate::breakpoint::Breakpoint>) -> DebugResult<Vec<crate::breakpoint::Breakpoint>> {
        Ok(breakpoints)
    }

    async fn set_exception_breakpoints(&mut self, filters: Vec<ExceptionFilter>) -> DebugResult<Vec<ExceptionBreakpoint>> {
        Ok(filters.iter().map(|f| ExceptionBreakpoint {
            filter_id: f.clone(),
            verified: true,
        }).collect())
    }

    async fn continue_execution(&mut self) -> DebugResult<()> {
        Ok(())
    }

    async fn pause(&mut self) -> DebugResult<()> {
        Ok(())
    }

    async fn step(&mut self, mode: StepMode) -> DebugResult<()> {
        Ok(())
    }

    async fn get_threads(&self) -> DebugResult<Vec<Thread>> {
        Ok(Vec::new())
    }

    async fn get_stack_trace(&self, thread_id: i64, start_frame: i64, levels: i64) -> DebugResult<Vec<crate::stack::StackFrame>> {
        Ok(Vec::new())
    }

    async fn get_scopes(&self, frame_id: i64) -> DebugResult<Vec<crate::types::Scope>> {
        Ok(Vec::new())
    }

    async fn get_variables(&self, variables_reference: i64) -> DebugResult<Vec<crate::variables::Variable>> {
        Ok(Vec::new())
    }

    async fn evaluate(&self, expression: &str, frame_id: i64, context: EvaluateContext) -> DebugResult<crate::types::EvaluationResult> {
        Ok(crate::types::EvaluationResult::new(format!("<evaluated: {}>", expression)))
    }

    async fn set_variable(&self, variables_reference: i64, name: &str, value: &str) -> DebugResult<()> {
        Ok(())
    }

    async fn get_source(&self, source_reference: i64) -> DebugResult<String> {
        Ok(String::new())
    }

    async fn get_capabilities(&self) -> DebugResult<DebugCapabilities> {
        Ok(self.capabilities.clone())
    }

    fn get_session_state(&self) -> DebugSessionState {
        self.session.as_ref().map(|s| s.state).unwrap_or(DebugSessionState::Stopped)
    }

    fn get_session(&self) -> Option<DebugSession> {
        self.session.clone()
    }

    fn is_connected(&self) -> bool {
        self.connected
    }
}

/// Exception filter
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExceptionFilter {
    pub filter_id: String,
    pub condition: Option<String>,
}

/// Exception breakpoint
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExceptionBreakpoint {
    pub filter_id: String,
    pub verified: bool,
}

/// Evaluate context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EvaluateContext {
    Watch,
    Repl,
    Hover,
    Clipboard,
    Variables,
}
