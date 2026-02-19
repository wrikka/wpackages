use crate::error::{AdvancedDebuggingError, AdvancedDebuggingResult};
use crate::types::{
    AdvancedBreakpoint, AdvancedDebugSession, AdvancedStackFrame, DebugEvent, DebugSessionState,
    ExceptionBreakpoint, ExceptionType, HitCondition, StepOperation, ThreadInfo, ThreadState,
    WatchExpression, WatchValue,
};
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tracing::{debug, info, warn};

/// Advanced debugging client trait
#[async_trait]
pub trait AdvancedDebuggingClient: Send + Sync {
    /// Create debug session
    async fn create_session(&self, name: String) -> AdvancedDebugResult<AdvancedDebugSession>;

    /// Get session
    async fn get_session(&self, id: &str) -> AdvancedDebugResult<AdvancedDebugSession>;

    /// Get all sessions
    async fn get_all_sessions(&self) -> AdvancedDebugResult<Vec<AdvancedDebugSession>>;

    /// Delete session
    async fn delete_session(&self, id: &str) -> AdvancedDebugResult<bool>;

    /// Add breakpoint
    async fn add_breakpoint(&self, session_id: &str, breakpoint: AdvancedBreakpoint) -> AdvancedDebugResult<()>;

    /// Remove breakpoint
    async fn remove_breakpoint(&self, session_id: &str, breakpoint_id: &str) -> AdvancedDebugResult<bool>;

    /// Enable/disable breakpoint
    async fn toggle_breakpoint(&self, session_id: &str, breakpoint_id: &str, enabled: bool) -> AdvancedDebugResult<bool>;

    /// Add watch expression
    async fn add_watch(&self, session_id: &str, watch: WatchExpression) -> AdvancedDebugResult<()>;

    /// Remove watch
    async fn remove_watch(&self, session_id: &str, watch_id: &str) -> AdvancedDebugResult<bool>;

    /// Update watch value
    async fn update_watch(&self, session_id: &str, watch_id: &str, value: WatchValue) -> AdvancedDebugResult<bool>;

    /// Step
    async fn step(&self, session_id: &str, operation: StepOperation) -> AdvancedDebugResult<()>;

    /// Continue execution
    async fn continue_execution(&self, session_id: &str) -> AdvancedDebugResult<()>;

    /// Pause execution
    async fn pause_execution(&self, session_id: &str) -> AdvancedDebugResult<()>;

    /// Set current stack frame
    async fn set_current_frame(&self, session_id: &str, frame_index: usize) -> AdvancedDebugResult<()>;

    /// Get call stack
    async fn get_call_stack(&self, session_id: &str) -> AdvancedDebugResult<Vec<AdvancedStackFrame>>;

    /// Get threads
    async fn get_threads(&self, session_id: &str) -> AdvancedDebugResult<Vec<ThreadInfo>>;

    /// Add exception breakpoint
    async fn add_exception_breakpoint(&self, session_id: &str, exception: ExceptionBreakpoint) -> AdvancedDebugResult<()>;

    /// Remove exception breakpoint
    async fn remove_exception_breakpoint(&self, session_id: &str, exception_id: &str) -> AdvancedDebugResult<bool>;

    /// Get debug events
    async fn get_events(&self, session_id: &str) -> AdvancedDebugResult<Vec<DebugEvent>>;

    /// Evaluate expression
    async fn evaluate_expression(&self, session_id: &str, expression: String) -> AdvancedDebugResult<WatchValue>;

    /// Get session state
    async fn get_session_state(&self, session_id: &str) -> AdvancedDebugResult<DebugSessionState>;
}

/// Advanced debugging client implementation
pub struct AdvancedDebuggingClientImpl {
    sessions: Arc<Mutex<HashMap<String, AdvancedDebugSession>>>,
    events: Arc<Mutex<HashMap<String, Vec<DebugEvent>>>>,
}

impl AdvancedDebuggingClientImpl {
    pub fn new() -> Self {
        Self {
            sessions: Arc::new(Mutex::new(HashMap::new())),
            events: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn with_sessions(mut self, sessions: HashMap<String, AdvancedDebugSession>) -> Self {
        self.sessions = Arc::new(Mutex::new(sessions));
        self
    }

    fn add_event(&self, session_id: &str, event: DebugEvent) {
        let mut events = self.events.lock().unwrap();
        events.entry(session_id.to_string()).or_insert_with(Vec::new).push(event);
    }

    fn simulate_step(&self, session: &mut AdvancedDebugSession, operation: StepOperation) {
        match operation {
            StepOperation::StepOver => {
                info!("Stepping over");
                if let Some(frame) = session.get_current_frame_mut() {
                    frame.line += 1;
                }
            }
            StepOperation::StepInto => {
                info!("Stepping into");
                if let Some(frame) = session.get_current_frame() {
                    let new_frame = AdvancedStackFrame::new(
                        uuid::Uuid::new_v4().to_string(),
                        format!("{}_inner", frame.function_name),
                        frame.file_path.clone(),
                        frame.line + 1,
                    )
                    .with_is_top_frame(true);

                    session.call_stack.insert(0, new_frame);
                    session.current_frame = Some(0);
                }
            }
            StepOperation::StepOut => {
                info!("Stepping out");
                if session.call_stack.len() > 1 {
                    session.call_stack.remove(0);
                    session.current_frame = Some(0);
                }
            }
            StepOperation::Continue => {
                info!("Continuing execution");
                session.state = DebugSessionState::Running;
            }
            StepOperation::Pause => {
                info!("Pausing execution");
                session.state = DebugSessionState::Paused;
            }
        }
    }

    fn evaluate_expression_impl(&self, session: &AdvancedDebugSession, expression: &str) -> WatchValue {
        // Simplified expression evaluation
        if let Some(frame) = session.get_current_frame() {
            if let Some(value) = frame.get_variable(expression) {
                return value.clone();
            }
        }

        // Try to parse as number
        if expression.parse::<i32>().is_ok() {
            return WatchValue::new(expression).with_type("i32");
        }

        if expression.parse::<f64>().is_ok() {
            return WatchValue::new(expression).with_type("f64");
        }

        // Default to string
        WatchValue::new(expression).with_type("str")
    }
}

impl Default for AdvancedDebuggingClientImpl {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl AdvancedDebuggingClient for AdvancedDebuggingClientImpl {
    async fn create_session(&self, name: String) -> AdvancedDebugResult<AdvancedDebugSession> {
        info!("Creating debug session: {}", name);

        let session = AdvancedDebugSession::new(uuid::Uuid::new_v4().to_string(), name)
            .with_state(DebugSessionState::Starting);

        let mut sessions = self.sessions.lock().map_err(|e| AdvancedDebuggingError::Other(e.into()))?;
        sessions.insert(session.id.clone(), session.clone());

        // Add initial thread
        let thread = ThreadInfo::new("main", "Main Thread");
        let mut session_mut = sessions.get_mut(&session.id).unwrap();
        session_mut.add_thread(thread);

        info!("Session created: {}", session.id);

        Ok(session)
    }

    async fn get_session(&self, id: &str) -> AdvancedDebugResult<AdvancedDebugSession> {
        let sessions = self.sessions.lock().map_err(|e| AdvancedDebuggingError::Other(e.into()))?;

        sessions
            .get(id)
            .cloned()
            .ok_or_else(|| AdvancedDebuggingError::SessionNotFound(id.to_string()))
    }

    async fn get_all_sessions(&self) -> AdvancedDebugResult<Vec<AdvancedDebugSession>> {
        let sessions = self.sessions.lock().map_err(|e| AdvancedDebuggingError::Other(e.into()))?;
        Ok(sessions.values().cloned().collect())
    }

    async fn delete_session(&self, id: &str) -> AdvancedDebugResult<bool> {
        let mut sessions = self.sessions.lock().map_err(|e| AdvancedDebuggingError::Other(e.into()))?;

        if sessions.remove(id).is_some() {
            let mut events = self.events.lock().unwrap();
            events.remove(id);
            Ok(true)
        } else {
            Ok(false)
        }
    }

    async fn add_breakpoint(&self, session_id: &str, breakpoint: AdvancedBreakpoint) -> AdvancedDebugResult<()> {
        info!("Adding breakpoint to session {}: {:?}", session_id, breakpoint.id);

        let mut sessions = self.sessions.lock().map_err(|e| AdvancedDebuggingError::Other(e.into()))?;

        let session = sessions
            .get_mut(session_id)
            .ok_or_else(|| AdvancedDebuggingError::SessionNotFound(session_id.to_string()))?;

        session.add_breakpoint(breakpoint);

        Ok(())
    }

    async fn remove_breakpoint(&self, session_id: &str, breakpoint_id: &str) -> AdvancedDebugResult<bool> {
        info!("Removing breakpoint {} from session {}", breakpoint_id, session_id);

        let mut sessions = self.sessions.lock().map_err(|e| AdvancedDebuggingError::Other(e.into()))?;

        let session = sessions
            .get_mut(session_id)
            .ok_or_else(|| AdvancedDebuggingError::SessionNotFound(session_id.to_string()))?;

        Ok(session.remove_breakpoint(breakpoint_id))
    }

    async fn toggle_breakpoint(&self, session_id: &str, breakpoint_id: &str, enabled: bool) -> AdvancedDebugResult<bool> {
        info!("Toggling breakpoint {} to {} in session {}", breakpoint_id, enabled, session_id);

        let mut sessions = self.sessions.lock().map_err(|e| AdvancedDebuggingError::Other(e.into()))?;

        let session = sessions
            .get_mut(session_id)
            .ok_or_else(|| AdvancedDebuggingError::SessionNotFound(session_id.to_string()))?;

        if let Some(bp) = session.get_breakpoint_mut(breakpoint_id) {
            bp.enabled = enabled;
            Ok(true)
        } else {
            Ok(false)
        }
    }

    async fn add_watch(&self, session_id: &str, watch: WatchExpression) -> AdvancedDebugResult<()> {
        info!("Adding watch to session {}: {:?}", session_id, watch.id);

        let mut sessions = self.sessions.lock().map_err(|e| AdvancedDebuggingError::Other(e.into()))?;

        let session = sessions
            .get_mut(session_id)
            .ok_or_else(|| AdvancedDebuggingError::SessionNotFound(session_id.to_string()))?;

        session.add_watch(watch);

        Ok(())
    }

    async fn remove_watch(&self, session_id: &str, watch_id: &str) -> AdvancedDebugResult<bool> {
        info!("Removing watch {} from session {}", watch_id, session_id);

        let mut sessions = self.sessions.lock().map_err(|e| AdvancedDebuggingError::Other(e.into()))?;

        let session = sessions
            .get_mut(session_id)
            .ok_or_else(|| AdvancedDebuggingError::SessionNotFound(session_id.to_string()))?;

        Ok(session.remove_watch(watch_id))
    }

    async fn update_watch(&self, session_id: &str, watch_id: &str, value: WatchValue) -> AdvancedDebugResult<bool> {
        info!("Updating watch {} in session {}", watch_id, session_id);

        let mut sessions = self.sessions.lock().map_err(|e| AdvancedDebuggingError::Other(e.into()))?;

        let session = sessions
            .get_mut(session_id)
            .ok_or_else(|| AdvancedDebuggingError::SessionNotFound(session_id.to_string()))?;

        if let Some(watch) = session.get_watch_mut(watch_id) {
            watch.update_value(value);
            Ok(true)
        } else {
            Ok(false)
        }
    }

    async fn step(&self, session_id: &str, operation: StepOperation) -> AdvancedDebugResult<()> {
        info!("Stepping in session {}: {:?}", session_id, operation);

        let mut sessions = self.sessions.lock().map_err(|e| AdvancedDebuggingError::Other(e.into()))?;

        let session = sessions
            .get_mut(session_id)
            .ok_or_else(|| AdvancedDebuggingError::SessionNotFound(session_id.to_string()))?;

        self.simulate_step(session, operation);

        Ok(())
    }

    async fn continue_execution(&self, session_id: &str) -> AdvancedDebugResult<()> {
        info!("Continuing execution in session {}", session_id);

        let mut sessions = self.sessions.lock().map_err(|e| AdvancedDebuggingError::Other(e.into()))?;

        let session = sessions
            .get_mut(session_id)
            .ok_or_else(|| AdvancedDebuggingError::SessionNotFound(session_id.to_string()))?;

        session.state = DebugSessionState::Running;

        Ok(())
    }

    async fn pause_execution(&self, session_id: &str) -> AdvancedDebugResult<()> {
        info!("Pausing execution in session {}", session_id);

        let mut sessions = self.sessions.lock().map_err(|e| AdvancedDebuggingError::Other(e.into()))?;

        let session = sessions
            .get_mut(session_id)
            .ok_or_else(|| AdvancedDebuggingError::SessionNotFound(session_id.to_string()))?;

        session.state = DebugSessionState::Paused;

        self.add_event(session_id, DebugEvent::ThreadStopped {
            thread_id: "main".to_string(),
            reason: "Paused".to_string(),
        });

        Ok(())
    }

    async fn set_current_frame(&self, session_id: &str, frame_index: usize) -> AdvancedDebugResult<()> {
        info!("Setting current frame to {} in session {}", frame_index, session_id);

        let mut sessions = self.sessions.lock().map_err(|e| AdvancedDebuggingError::Other(e.into()))?;

        let session = sessions
            .get_mut(session_id)
            .ok_or_else(|| AdvancedDebuggingError::SessionNotFound(session_id.to_string()))?;

        session.set_current_frame(frame_index);

        Ok(())
    }

    async fn get_call_stack(&self, session_id: &str) -> AdvancedDebugResult<Vec<AdvancedStackFrame>> {
        let sessions = self.sessions.lock().map_err(|e| AdvancedDebuggingError::Other(e.into()))?;

        let session = sessions
            .get(session_id)
            .ok_or_else(|| AdvancedDebuggingError::SessionNotFound(session_id.to_string()))?;

        Ok(session.call_stack.clone())
    }

    async fn get_threads(&self, session_id: &str) -> AdvancedDebugResult<Vec<ThreadInfo>> {
        let sessions = self.sessions.lock().map_err(|e| AdvancedDebuggingError::Other(e.into()))?;

        let session = sessions
            .get(session_id)
            .ok_or_else(|| AdvancedDebuggingError::SessionNotFound(session_id.to_string()))?;

        Ok(session.threads.clone())
    }

    async fn add_exception_breakpoint(&self, session_id: &str, exception: ExceptionBreakpoint) -> AdvancedDebugResult<()> {
        info!("Adding exception breakpoint to session {}: {:?}", session_id, exception.id);

        let mut sessions = self.sessions.lock().map_err(|e| AdvancedDebuggingError::Other(e.into()))?;

        let session = sessions
            .get_mut(session_id)
            .ok_or_else(|| AdvancedDebuggingError::SessionNotFound(session_id.to_string()))?;

        session.add_exception_breakpoint(exception);

        Ok(())
    }

    async fn remove_exception_breakpoint(&self, session_id: &str, exception_id: &str) -> AdvancedDebugResult<bool> {
        info!("Removing exception breakpoint {} from session {}", exception_id, session_id);

        let mut sessions = self.sessions.lock().map_err(|e| AdvancedDebuggingError::Other(e.into()))?;

        let session = sessions
            .get_mut(session_id)
            .ok_or_else(|| AdvancedDebuggingError::SessionNotFound(session_id.to_string()))?;

        if let Some(pos) = session.exception_breakpoints.iter().position(|e| e.id == exception_id) {
            session.exception_breakpoints.remove(pos);
            Ok(true)
        } else {
            Ok(false)
        }
    }

    async fn get_events(&self, session_id: &str) -> AdvancedDebugResult<Vec<DebugEvent>> {
        let events = self.events.lock().unwrap();

        if let Some(session_events) = events.get(session_id) {
            Ok(session_events.clone())
        } else {
            Ok(Vec::new())
        }
    }

    async fn evaluate_expression(&self, session_id: &str, expression: String) -> AdvancedDebugResult<WatchValue> {
        info!("Evaluating expression in session {}: {}", session_id, expression);

        let sessions = self.sessions.lock().map_err(|e| AdvancedDebuggingError::Other(e.into()))?;

        let session = sessions
            .get(session_id)
            .ok_or_else(|| AdvancedDebuggingError::SessionNotFound(session_id.to_string()))?;

        Ok(self.evaluate_expression_impl(session, &expression))
    }

    async fn get_session_state(&self, session_id: &str) -> AdvancedDebugResult<DebugSessionState> {
        let sessions = self.sessions.lock().map_err(|e| AdvancedDebuggingError::Other(e.into()))?;

        let session = sessions
            .get(session_id)
            .ok_or_else(|| AdvancedDebuggingError::SessionNotFound(session_id.to_string()))?;

        Ok(session.state)
    }
}

/// Create a new advanced debugging client
pub fn create_advanced_debugging_client() -> AdvancedDebuggingClientImpl {
    AdvancedDebuggingClientImpl::new()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[tokio::test]
    async fn test_advanced_debugging_client() {
        let client = create_advanced_debugging_client();

        // Create session
        let session = client.create_session("Test Session".to_string()).await.unwrap();

        assert_eq!(session.name, "Test Session");
        assert_eq!(session.state, DebugSessionState::Starting);

        // Get session
        let retrieved = client.get_session(&session.id).await.unwrap();
        assert_eq!(retrieved.id, session.id);

        // Get all sessions
        let all = client.get_all_sessions().await.unwrap();
        assert_eq!(all.len(), 1);
    }

    #[tokio::test]
    async fn test_breakpoints() {
        let client = create_advanced_debugging_client();

        let session = client.create_session("Test".to_string()).await.unwrap();

        let bp = AdvancedBreakpoint::new("bp1", PathBuf::from("test.rs"), 10);
        client.add_breakpoint(&session.id, bp).await.unwrap();

        let retrieved = client.get_session(&session.id).await.unwrap();
        assert_eq!(retrieved.breakpoint_count(), 1);

        // Toggle breakpoint
        client.toggle_breakpoint(&session.id, "bp1", false).await.unwrap();

        let retrieved = client.get_session(&session.id).await.unwrap();
        assert!(!retrieved.get_breakpoint("bp1").unwrap().enabled);

        // Remove breakpoint
        let removed = client.remove_breakpoint(&session.id, "bp1").await.unwrap();
        assert!(removed);
    }

    #[tokio::test]
    async fn test_watches() {
        let client = create_advanced_debugging_client();

        let session = client.create_session("Test".to_string()).await.unwrap();

        let watch = WatchExpression::new("watch1", "x + y");
        client.add_watch(&session.id, watch).await.unwrap();

        let retrieved = client.get_session(&session.id).await.unwrap();
        assert_eq!(retrieved.watch_count(), 1);

        // Update watch
        let value = WatchValue::new("10").with_type("i32");
        client.update_watch(&session.id, "watch1", value).await.unwrap();

        // Remove watch
        let removed = client.remove_watch(&session.id, "watch1").await.unwrap();
        assert!(removed);
    }

    #[tokio::test]
    async fn test_step_operations() {
        let client = create_advanced_debugging_client();

        let session = client.create_session("Test".to_string()).await.unwrap();

        // Set up call stack
        let frame = AdvancedStackFrame::new("frame1", "main", PathBuf::from("test.rs"), 10)
            .with_is_top_frame(true)
            .with_variables(HashMap::from([("x".to_string(), WatchValue::new("10"))]));

        let mut session_mut = client.sessions.lock().unwrap();
        let s = session_mut.get_mut(&session.id).unwrap();
        s.set_call_stack(vec![frame]);
        drop(session_mut);

        // Step over
        client.step(&session.id, StepOperation::StepOver).await.unwrap();

        let retrieved = client.get_session(&session.id).await.unwrap();
        assert_eq!(retrieved.get_current_frame().unwrap().line, 11);

        // Step into
        client.step(&session.id, StepOperation::StepInto).await.unwrap();

        let retrieved = client.get_session(&session.id).await.unwrap();
        assert_eq!(retrieved.stack_depth(), 2);

        // Step out
        client.step(&session.id, StepOperation::StepOut).await.unwrap();

        let retrieved = client.get_session(&session.id).await.unwrap();
        assert_eq!(retrieved.stack_depth(), 1);
    }

    #[tokio::test]
    async fn test_exception_breakpoints() {
        let client = create_advanced_debugging_client();

        let session = client.create_session("Test".to_string()).await.unwrap();

        let ex_bp = ExceptionBreakpoint::new("ex1", ExceptionType::Specific("NullPointerException"));
        client.add_exception_breakpoint(&session.id, ex_bp).await.unwrap();

        let retrieved = client.get_session(&session.id).await.unwrap();
        assert_eq!(retrieved.exception_breakpoints.len(), 1);

        // Remove exception breakpoint
        let removed = client.remove_exception_breakpoint(&session.id, "ex1").await.unwrap();
        assert!(removed);
    }

    #[tokio::test]
    async fn test_evaluate_expression() {
        let client = create_advanced_debugging_client();

        let session = client.create_session("Test".to_string()).await.unwrap();

        // Set up call stack with variables
        let mut variables = HashMap::new();
        variables.insert("x".to_string(), WatchValue::new("10").with_type("i32"));
        variables.insert("y".to_string(), WatchValue::new("20").with_type("i32"));

        let frame = AdvancedStackFrame::new("frame1", "main", PathBuf::from("test.rs"), 10)
            .with_is_top_frame(true)
            .with_variables(variables);

        let mut sessions = client.sessions.lock().unwrap();
        let s = sessions.get_mut(&session.id).unwrap();
        s.set_call_stack(vec![frame]);
        drop(sessions);

        // Evaluate variable
        let result = client.evaluate_expression(&session.id, "x".to_string()).await.unwrap();
        assert_eq!(result.value, "10");
        assert_eq!(result.type_name, Some("i32".to_string()));

        // Evaluate number
        let result = client.evaluate_expression(&session.id, "42".to_string()).await.unwrap();
        assert_eq!(result.value, "42");
        assert_eq!(result.type_name, Some("i32".to_string()));
    }
}
