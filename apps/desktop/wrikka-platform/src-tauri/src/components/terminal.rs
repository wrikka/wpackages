use crate::error::Result;

pub struct TerminalComponent {
    pub shell: String,
}

impl TerminalComponent {
    pub fn new(shell: String) -> Self {
        Self { shell }
    }

    pub fn spawn(&self) -> Result<()> {
        Ok(())
    }
}
