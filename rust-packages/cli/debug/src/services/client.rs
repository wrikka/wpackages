use crate::adapter::{DebugAdapter, DebugAdapterFactory};
use crate::breakpoint::{Breakpoint, BreakpointManager, BreakpointState};
use crate::error::{DebugError, DebugResult};
use crate::stack::{CallStack, StackFrame};
use crate::types::{
    DebugCapabilities, DebugConfig, DebugSession, DebugSessionState, EvaluateContext,
    EvaluationResult, ExceptionFilter, OutputEvent, ProcessInfo, Scope, SourceLocation, StepMode,
    Thread, Variable,
};
use crate::variables::{VariableManager, VariableValue};
use async_trait::async_trait;
use std::sync::{Arc, Mutex};
use tracing::{debug, info, warn};

/// Debug client trait
#[async_trait]
pub trait DebugClient: Send + Sync {
    /// Start a debug session
    async fn start_session(&mut self, config: DebugConfig) -> DebugResult<DebugSession>;

    /// Attach to a running process
    async fn attach(&mut self, pid: u32, config: DebugConfig) -> DebugResult<DebugSession>;

    /// Stop the debug session
    async fn stop_session(&mut self) -> DebugResult<()>;

    /// Restart the debug session
    async fn restart_session(&mut self) -> DebugResult<()>;

    /// Continue execution
    async fn continue_execution(&mut self) -> DebugResult<()>;

    /// Pause execution
    async fn pause(&mut self) -> DebugResult<()>;

    /// Step execution
    async fn step(&mut self, mode: StepMode) -> DebugResult<()>;

    /// Set breakpoints
    async fn set_breakpoints(&mut self, breakpoints: Vec<Breakpoint>) -> DebugResult<Vec<Breakpoint>>;

    /// Toggle breakpoint
    async fn toggle_breakpoint(&mut self, breakpoint: Breakpoint) -> DebugResult<bool>;

    /// Remove breakpoint
    async fn remove_breakpoint(&mut self, id: &str) -> DebugResult<Breakpoint>;

    /// Get all breakpoints
    async fn get_breakpoints(&mut self) -> DebugResult<Vec<Breakpoint>>;

    /// Get breakpoint state
    async fn get_breakpoint_state(&self, id: &str) -> DebugResult<BreakpointState>;

    /// Set exception breakpoints
    async fn set_exception_breakpoints(&mut self, filters: Vec<ExceptionFilter>) -> DebugResult<Vec<crate::adapter::ExceptionBreakpoint>>;

    /// Get threads
    async fn get_threads(&self) -> DebugResult<Vec<Thread>>;

    /// Get stack trace
    async fn get_stack_trace(&self, thread_id: i64, start_frame: i64, levels: i64) -> DebugResult<Vec<StackFrame>>;

    /// Get current stack frame
    async fn get_current_frame(&self) -> DebugResult<Option<StackFrame>>;

    /// Get scopes
    async fn get_scopes(&self, frame_id: i64) -> DebugResult<Vec<Scope>>;

    /// Get variables
    async fn get_variables(&self, variables_reference: i64) -> DebugResult<Vec<Variable>>;

    /// Evaluate expression
    async fn evaluate(&self, expression: &str, frame_id: i64, context: EvaluateContext) -> DebugResult<EvaluationResult>;

    /// Set variable value
    async fn set_variable(&self, variables_reference: i64, name: &str, value: &str) -> DebugResult<()>;

    /// Get session state
    async fn get_session_state(&self) -> DebugResult<DebugSessionState>;

    /// Get session
    async fn get_session(&self) -> DebugResult<Option<DebugSession>>;

    /// Get capabilities
    async fn get_capabilities(&self) -> DebugResult<DebugCapabilities>;

    /// Is connected
    async fn is_connected(&self) -> DebugResult<bool>;

    /// Get process info
    async fn get_process_info(&self) -> DebugResult<Option<ProcessInfo>>;

    /// Get output events
    async fn get_output_events(&self) -> DebugResult<Vec<OutputEvent>>;

    /// Clear output events
    async fn clear_output_events(&mut self) -> DebugResult<()>;

    /// Get breakpoint manager
    fn breakpoint_manager(&self) -> Arc<BreakpointManager>;

    /// Get variable manager
    fn variable_manager(&self) -> Arc<VariableManager>;

    /// Get call stack
    fn call_stack(&self) -> Arc<CallStack>;
}

/// Debug client implementation
pub struct DebugClientImpl {
    adapter: Arc<Mutex<Option<Box<dyn DebugAdapter>>>>,
    breakpoint_manager: Arc<BreakpointManager>,
    variable_manager: Arc<VariableManager>,
    call_stack: Arc<CallStack>,
    output_events: Arc<Mutex<Vec<OutputEvent>>>>,
}

impl DebugClientImpl {
    pub fn new() -> Self {
        Self {
            adapter: Arc::new(Mutex::new(None)),
            breakpoint_manager: Arc::new(BreakpointManager::new()),
            variable_manager: Arc::new(VariableManager::new()),
            call_stack: Arc::new(CallStack::new()),
            output_events: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn breakpoint_manager(&self) -> Arc<BreakpointManager> {
        self.breakpoint_manager.clone()
    }

    pub fn variable_manager(&self) -> Arc<VariableManager> {
        self.variable_manager.clone()
    }

    pub fn call_stack(&self) -> Arc<CallStack> {
        self.call_stack.clone()
    }

    async fn ensure_adapter(&self) -> DebugResult<&mut Box<dyn DebugAdapter>> {
        let mut adapter_guard = self.adapter.lock().map_err(|e| DebugError::Other(e.to_string()))?;

        if adapter_guard.is_none() {
            return Err(DebugError::NotConnected);
        }

        // This is a workaround - we can't return a mutable reference from MutexGuard
        // In a real implementation, we would use a different approach
        Err(DebugError::Other(anyhow::any!("Cannot return mutable reference")))
    }

    async fn with_adapter<F, R>(&self, f: F) -> DebugResult<R>
    where
        F: FnOnce(&mut Box<dyn DebugAdapter>) -> DebugResult<R> + Send,
        R: Send,
    {
        let mut adapter_guard = self.adapter.lock().map_err(|e| DebugError::Other(e.to_string()))?;

        if let Some(adapter) = adapter_guard.as_mut() {
            f(adapter)
        } else {
            Err(DebugError::NotConnected)
        }
    }
}

impl Default for DebugClientImpl {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl DebugClient for DebugClientImpl {
    async fn start_session(&mut self, config: DebugConfig) -> DebugResult<DebugSession> {
        info!("Starting debug session: {:?}", config);

        if self.adapter.lock().map_err(|e| DebugError::Other(e.to_string()))?.is_some() {
            return Err(DebugError::AlreadyConnected);
        }

        let mut adapter = DebugAdapterFactory::create(&config.adapter_type)?;
        let session = adapter.launch(config).await?;

        let mut adapter_guard = self.adapter.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        *adapter_guard = Some(adapter);

        info!("Debug session started: {}", session.id);

        Ok(session)
    }

    async fn attach(&mut self, pid: u32, config: DebugConfig) -> DebugResult<DebugSession> {
        info!("Attaching to process {}: {:?}", pid, config);

        if self.adapter.lock().map_err(|e| DebugError::Other(e.to_string()))?.is_some() {
            return Err(DebugError::AlreadyConnected);
        }

        let mut adapter = DebugAdapterFactory::create(&config.adapter_type)?;
        let session = adapter.attach(pid, config).await?;

        let mut adapter_guard = self.adapter.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        *adapter_guard = Some(adapter);

        info!("Attached to process {}", pid);

        Ok(session)
    }

    async fn stop_session(&mut self) -> DebugResult<()> {
        info!("Stopping debug session");

        self.with_adapter(|adapter| {
            adapter.disconnect()?;
            Ok(())
        })
        .await?;

        let mut adapter_guard = self.adapter.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        *adapter_guard = None;

        Ok(())
    }

    async fn restart_session(&mut self) -> DebugResult<()> {
        info!("Restarting debug session");

        self.with_adapter(|adapter| {
            adapter.restart()?;
            Ok(())
        })
        .await?;

        Ok(())
    }

    async fn continue_execution(&mut self) -> DebugResult<()> {
        debug!("Continuing execution");

        self.with_adapter(|adapter| {
            adapter.continue_execution()?;
            Ok(())
        })
        .await?;

        Ok(())
    }

    async fn pause(&mut self) -> DebugResult<()> {
        debug!("Pausing execution");

        self.with_adapter(|adapter| {
            adapter.pause()?;
            Ok(())
        })
        .await?;

        Ok(())
    }

    async fn step(&mut self, mode: StepMode) -> DebugResult<()> {
        debug!("Stepping: {:?}", mode);

        self.with_adapter(|adapter| {
            adapter.step(mode)?;
            Ok(())
        })
        .await?;

        Ok(())
    }

    async fn set_breakpoints(&mut self, breakpoints: Vec<Breakpoint>) -> DebugResult<Vec<Breakpoint>> {
        debug!("Setting {} breakpoints", breakpoints.len());

        let result = self.with_adapter(|adapter| {
            adapter.set_breakpoints(breakpoints.clone())
        })
        .await?;

        // Update breakpoint manager
        for bp in &result {
            self.breakpoint_manager.add(bp.clone())?;
            self.breakpoint_manager.set_state(&bp.id, BreakpointState::Verified)?;
        }

        Ok(result)
    }

    async fn toggle_breakpoint(&mut self, breakpoint: Breakpoint) -> DebugResult<bool> {
        debug!("Toggling breakpoint at {:?}", breakpoint.source);

        let enabled = self.breakpoint_manager.toggle(&breakpoint.id)?;

        if enabled {
            self.breakpoint_manager.remove(&breakpoint.id)?;
        } else {
            self.breakpoint_manager.add(breakpoint)?;
        }

        Ok(enabled)
    }

    async fn remove_breakpoint(&mut self, id: &str) -> DebugResult<Breakpoint> {
        debug!("Removing breakpoint: {}", id);

        let bp = self.breakpoint_manager.remove(id)?;

        Ok(bp)
    }

    async fn get_breakpoints(&mut self) -> DebugResult<Vec<Breakpoint>> {
        self.breakpoint_manager.get_all()
    }

    async fn get_breakpoint_state(&self, id: &str) -> DebugResult<BreakpointState> {
        self.breakpoint_manager.get_state(id)
    }

    async fn set_exception_breakpoints(&mut self, filters: Vec<ExceptionFilter>) -> DebugResult<Vec<crate::adapter::ExceptionBreakpoint>> {
        debug!("Setting exception breakpoints: {:?}", filters);

        self.with_adapter(|adapter| {
            adapter.set_exception_breakpoints(filters)
        })
        .await
    }

    async fn get_threads(&self) -> DebugResult<Vec<Thread>> {
        self.with_adapter(|adapter| {
            adapter.get_threads()
        })
        .await
    }

    async fn get_stack_trace(&self, thread_id: i64, start_frame: i64, levels: i64) -> DebugResult<Vec<StackFrame>> {
        debug!("Getting stack trace: thread_id={}, start={}, levels={}", thread_id, start_frame, levels);

        let frames = self.with_adapter(|adapter| {
            adapter.get_stack_trace(thread_id, start_frame, levels)
        })
        .await?;

        self.call_stack.set_frames(frames.clone())?;

        Ok(frames)
    }

    async fn get_current_frame(&self) -> DebugResult<Option<StackFrame>> {
        self.call_stack.get_current_frame()
    }

    async fn get_scopes(&self, frame_id: i64) -> DebugResult<Vec<Scope>> {
        debug!("Getting scopes for frame {}", frame_id);

        let scopes = self.with_adapter(|adapter| {
            adapter.get_scopes(frame_id)
        })
        .await?;

        self.variable_manager.set_scopes(scopes.clone())?;

        Ok(scopes)
    }

    async fn get_variables(&self, variables_reference: i64) -> DebugResult<Vec<Variable>> {
        debug!("Getting variables for reference {}", variables_reference);

        let variables = self.with_adapter(|adapter| {
            adapter.get_variables(variables_reference)
        })
        .await?;

        self.variable_manager.set_variables(variables_reference, variables.clone())?;

        Ok(variables)
    }

    async fn evaluate(&self, expression: &str, frame_id: i64, context: EvaluateContext) -> DebugResult<EvaluationResult> {
        debug!("Evaluating expression '{}' in frame {} with context {:?}", expression, frame_id, context);

        self.with_adapter(|adapter| {
            adapter.evaluate(expression, frame_id, context)
        })
        .await
    }

    async fn set_variable(&self, variables_reference: i64, name: &str, value: &str) -> DebugResult<()> {
        debug!("Setting variable {} = {} in reference {}", name, value, variables_reference);

        self.with_adapter(|adapter| {
            adapter.set_variable(variables_reference, name, value)
        })
        .await
    }

    async fn get_session_state(&self) -> DebugResult<DebugSessionState> {
        self.with_adapter(|adapter| {
            Ok(adapter.get_session_state())
        })
        .await
    }

    async fn get_session(&self) -> DebugResult<Option<DebugSession>> {
        self.with_adapter(|adapter| {
            Ok(adapter.get_session())
        })
        .await
    }

    async fn get_capabilities(&self) -> DebugResult<DebugCapabilities> {
        self.with_adapter(|adapter| {
            adapter.get_capabilities()
        })
        .await
    }

    async fn is_connected(&self) -> DebugResult<bool> {
        let adapter = self.adapter.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        Ok(adapter.as_ref().map(|a| a.is_connected()).unwrap_or(false))
    }

    async fn get_process_info(&self) -> DebugResult<Option<ProcessInfo>> {
        let session = self.get_session().await?;

        if let Some(session) {
            if let Some(pid) = session.pid {
                return Ok(Some(ProcessInfo {
                    pid,
                    name: session.config.program.clone(),
                    start_time: session.start_time,
                }));
            }
        }

        Ok(None)
    }

    async fn get_output_events(&self) -> DebugResult<Vec<OutputEvent>> {
        let events = self.output_events.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        Ok(events.clone())
    }

    async fn clear_output_events(&mut self) -> DebugResult<()> {
        let mut events = self.output_events.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        events.clear();
        Ok(())
    }
}

/// Create a new debug client
pub fn create_debug_client() -> DebugClientImpl {
    DebugClientImpl::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_debug_client() {
        let client = create_debug_client();

        // Test not connected
        assert!(!client.is_connected().await.unwrap());

        // Test breakpoint manager
        let uri = lsp_types::Url::parse("file:///test.rs").unwrap();
        let bp = Breakpoint::new(SourceLocation::new(uri, 10, 5));

        client.breakpoint_manager.add(bp).unwrap();
        assert_eq!(client.breakpoint_manager.count().unwrap(), 1);
    }
}
