use anyhow::{anyhow, Result};

pub struct CollaborationService {
    text: String,
}

impl CollaborationService {
    pub fn new() -> Self {
        Self {
            text: String::new(),
        }
    }

    pub fn get_text(&self) -> Result<String> {
        Ok(self.text.clone())
    }

    pub fn apply_change(&mut self, _change: &[u8]) -> Result<()> {
        // Stub implementation - automerge disabled due to compile issues
        Ok(())
    }
}
