use crate::types::debugging::DebugSessionState;

#[derive(Debug, Clone, Default)]
pub struct DebuggingState {
    pub session: DebugSessionState,
    pub active: bool,
    pub current_file: Option<String>,
    pub current_line: Option<usize>,
}

impl DebuggingState {
    pub fn new() -> Self {
        Self {
            session: DebugSessionState::new(),
            active: false,
            current_file: None,
            current_line: None,
        }
    }

    pub fn with_session(mut self, session: DebugSessionState) -> Self {
        self.session = session;
        self
    }

    pub fn with_active(mut self, active: bool) -> Self {
        self.active = active;
        self
    }

    pub fn with_current_file(mut self, file: Option<String>) -> Self {
        self.current_file = file;
        self
    }

    pub fn with_current_line(mut self, line: Option<usize>) -> Self {
        self.current_line = line;
        self
    }

    pub fn set_session(&mut self, session: DebugSessionState) {
        self.session = session;
    }

    pub fn start_debugging(&mut self, file: String, line: usize) {
        self.active = true;
        self.current_file = Some(file);
        self.current_line = Some(line);
    }

    pub fn stop_debugging(&mut self) {
        self.active = false;
        self.current_file = None;
        self.current_line = None;
    }

    pub fn is_active(&self) -> bool {
        self.active
    }
}
