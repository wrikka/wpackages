use crate::types::advanced_debugging::{AdvancedDebuggingClient, AdvancedDebugSession, StepOperation};

#[derive(Debug, Clone, Default)]
pub struct AdvancedDebuggingState {
    pub client: AdvancedDebuggingClient,
    pub current_session: Option<AdvancedDebugSession>,
    pub sessions: Vec<AdvancedDebugSession>,
    pub stepping: bool,
}

impl AdvancedDebuggingState {
    pub fn new() -> Self {
        Self {
            client: AdvancedDebuggingClient::new(),
            current_session: None,
            sessions: Vec::new(),
            stepping: false,
        }
    }

    pub fn with_client(mut self, client: AdvancedDebuggingClient) -> Self {
        self.client = client;
        self
    }

    pub fn with_current_session(mut self, session: AdvancedDebugSession) -> Self {
        self.current_session = Some(session);
        self
    }

    pub fn with_sessions(mut self, sessions: Vec<AdvancedDebugSession>) -> Self {
        self.sessions = sessions;
        self
    }

    pub fn with_stepping(mut self, stepping: bool) -> Self {
        self.stepping = stepping;
        self
    }

    pub fn set_current_session(&mut self, session: AdvancedDebugSession) {
        self.current_session = Some(session);
    }

    pub fn set_stepping(&mut self, stepping: bool) {
        self.stepping = stepping;
    }

    pub fn add_session(&mut self, session: AdvancedDebugSession) {
        self.sessions.push(session);
    }

    pub fn is_debugging(&self) -> bool {
        self.current_session.is_some()
    }

    pub fn is_stepping(&self) -> bool {
        self.stepping
    }

    pub fn session_count(&self) -> usize {
        self.sessions.len()
    }

    pub fn get_session(&self, id: &str) -> Option<&AdvancedDebugSession> {
        self.sessions.iter().find(|s| s.id == id)
    }

    pub fn get_current_session(&self) -> Option<&AdvancedDebugSession> {
        self.current_session.as_ref()
    }

    pub fn get_current_session_mut(&mut self) -> Option<&mut AdvancedDebugSession> {
        self.current_session.as_mut()
    }
}
