use std::fmt;

/// Application mode
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AppMode {
    Normal,
    Insert,
    Command,
    Search,
    Plan,
}

impl AppMode {
    /// Get display name for the mode
    pub fn name(&self) -> &str {
        match self {
            AppMode::Normal => "NORMAL",
            AppMode::Insert => "INSERT",
            AppMode::Command => "COMMAND",
            AppMode::Search => "SEARCH",
            AppMode::Plan => "PLAN",
        }
    }

    /// Check if mode allows text input
    pub fn is_input_mode(&self) -> bool {
        matches!(self, AppMode::Insert | AppMode::Command | AppMode::Search)
    }
}

impl fmt::Display for AppMode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.name())
    }
}
