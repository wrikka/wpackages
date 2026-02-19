//! Action types for automation

use serde::{Deserialize, Serialize};

/// Action types for automation
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Action {
    // Navigation
    Snapshot,
    Diff,

    // Mouse
    Move,
    Click,
    ClickElement { element_id: String },
    Swipe,

    // Keyboard
    Type,
    TypeText { element_id: String, text: String },
    Press,

    // Clipboard
    SetClipboard,
    GetClipboard,

    // Process & Window
    Launch,
    Kill,
    ListProcesses,
    ListWindows,
    FocusWindow,
    WaitForElement,

    // Vision
    Screenshot,
    Ocr,
    VisualSearch,

    // Recording
    StartRecording,
    StopRecording,

    // File
    HandleFileDialog,

    // History
    History,
    HistoryClear,
    Replay,

    // UI Automation
    #[cfg(feature = "uia")]
    UiTree,

    // Extended actions
    Wait { duration_ms: u64 },
    WaitDuration { duration: u64 },
    Navigate { url: String },
    Delete,
}

impl Action {
    pub fn is_navigation(&self) -> bool {
        matches!(self, Action::Snapshot | Action::Diff)
    }

    pub fn is_mouse(&self) -> bool {
        matches!(self, Action::Move | Action::Click | Action::ClickElement { .. } | Action::Swipe)
    }

    pub fn is_keyboard(&self) -> bool {
        matches!(self, Action::Type | Action::TypeText { .. } | Action::Press)
    }
}
