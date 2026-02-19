use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Command {
    pub id: String,
    pub action: Action,
    pub params: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Response {
    pub id: String,
    pub success: bool,
    pub data: Option<serde_json::Value>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "value")]
pub enum Action {
    Snapshot,
    Screenshot,
    Click,
    Type,
    Press,
    Move,
    ListProcesses,
    ListWindows,
    FocusWindow,
    UiTree,
    VisualSearch,
    Ocr,
    Swipe,
    History,
    HistoryClear,
    Replay,
    WaitForElement,
    Diff,
    SetClipboard,
    GetClipboard,
    HandleFileDialog,
    Launch,
    Kill,
    StartRecording,
    StopRecording,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnapshotNode {
    pub ref_id: String,
    pub role: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub attributes: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScreenInfo {
    pub index: u32,
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub is_primary: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Snapshot {
    /// Virtual desktop bounds
    pub width: u32,
    pub height: u32,
    /// Screen list (multi-monitor)
    pub screens: Vec<ScreenInfo>,
    pub nodes: Vec<SnapshotNode>,
}

impl Command {
    pub fn new(action: Action, params: serde_json::Value) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            action,
            params,
        }
    }
}

impl Response {
    pub fn success(id: String, data: Option<serde_json::Value>) -> Self {
        Self {
            id,
            success: true,
            data,
            error: None,
        }
    }

    pub fn error(id: String, error: String) -> Self {
        Self {
            id,
            success: false,
            data: None,
            error: Some(error),
        }
    }
}
