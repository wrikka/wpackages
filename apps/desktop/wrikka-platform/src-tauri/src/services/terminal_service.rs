use crate::error::Result;
use crate::components::TerminalComponent;

pub struct TerminalService {
    terminal: TerminalComponent,
}

impl TerminalService {
    pub fn new(terminal: TerminalComponent) -> Self {
        Self { terminal }
    }

    pub fn execute(&self, command: &str) -> Result<String> {
        Ok(format!("Executed: {}", command))
    }
}
