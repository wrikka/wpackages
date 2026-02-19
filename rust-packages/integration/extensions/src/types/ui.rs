use crate::types::id::CommandId;
use serde::{Deserialize, Serialize};

/// Defines known locations where extensions can contribute UI components.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum UiContributionPoint {
    /// The left side of the status bar.
    StatusBarLeft,
    /// The right side of the status bar.
    StatusBarRight,
}

/// Represents an item to be displayed in the status bar.
#[derive(Debug, Clone)]
pub struct StatusBarItem {
    /// Optional icon to display.
    pub icon: Option<String>,
    /// Text to display.
    pub text: String,
    /// Tooltip to show on hover.
    pub tooltip: Option<String>,
    /// The command to execute when the item is clicked.
    pub command: Option<CommandId>,
}
