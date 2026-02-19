use std::fmt;

/// Focusable panels in the application
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum FocusPanel {
    FileExplorer,
    ChatPanel,
    OutputDisplay,
    InputField,
    CommandPalette,
}

impl FocusPanel {
    /// Get all panels in navigation order
    pub fn all() -> Vec<FocusPanel> {
        vec![
            FocusPanel::FileExplorer,
            FocusPanel::ChatPanel,
            FocusPanel::OutputDisplay,
            FocusPanel::InputField,
        ]
    }

    /// Get next panel in navigation order
    pub fn next(&self) -> Self {
        match self {
            FocusPanel::FileExplorer => FocusPanel::ChatPanel,
            FocusPanel::ChatPanel => FocusPanel::OutputDisplay,
            FocusPanel::OutputDisplay => FocusPanel::InputField,
            FocusPanel::InputField => FocusPanel::FileExplorer,
            FocusPanel::CommandPalette => FocusPanel::CommandPalette,
        }
    }

    /// Get previous panel in navigation order
    pub fn prev(&self) -> Self {
        match self {
            FocusPanel::FileExplorer => FocusPanel::InputField,
            FocusPanel::ChatPanel => FocusPanel::FileExplorer,
            FocusPanel::OutputDisplay => FocusPanel::ChatPanel,
            FocusPanel::InputField => FocusPanel::OutputDisplay,
            FocusPanel::CommandPalette => FocusPanel::CommandPalette,
        }
    }

    /// Get display name for the panel
    pub fn name(&self) -> &str {
        match self {
            FocusPanel::FileExplorer => "File Explorer",
            FocusPanel::ChatPanel => "Chat",
            FocusPanel::OutputDisplay => "Output",
            FocusPanel::InputField => "Input",
            FocusPanel::CommandPalette => "Command Palette",
        }
    }
}

impl fmt::Display for FocusPanel {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.name())
    }
}
