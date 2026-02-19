pub mod params;
pub mod js_executor;
pub mod snapshot_diff;
pub mod visual_snapshot;
pub mod page_summary;
pub mod element_finder;
pub mod waits;
pub mod tabs;
pub mod history;
pub mod network;
pub mod har;
pub mod cookies;
pub mod websockets;
pub mod forms;
pub mod geolocation;
pub mod workflows;

use self::params::*;
use serde::{Deserialize, Serialize};
use std::fmt;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Context {
    pub session: String,
    pub headless: bool,
    pub datadir: Option<String>,
    pub stealth: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Command {
    pub id: String,
    pub action: Action,
    pub params: Params,
    pub context: Context,
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
    // Navigation
    Open,
    Back,
    Forward,
    Reload,

    // Interaction
    Click,
    Type,
    TypeSecret,
    Fill,
    Hover,
    Scroll,
    Drag,
    Check,
    Uncheck,
    Select,
    Upload,

    // Keyboard
    Press,
    KeyDown,
    KeyUp,

    // Information
    GetText,
    GetHtml,
    GetValue,
    GetAttr,
    GetTitle,
    GetUrl,
    IsVisible,
    IsEnabled,
    IsChecked,
    GetCount,
    GetBox,
    ExtractTable,

    // Snapshot
    Snapshot,
    DiffSnapshot,
    VisualSnapshot,
    SummarizePage,
    FindElement,

    // State
    WaitFor,
    GetHistory,

    // Network
    Network,
    GetHar,
    GetCookies,
    AddCookie,
    DeleteCookie,
    GetWebSocketFrames,

    // Automation
    AutomatedFill,
    SetGeolocation,

    // Workflows
    RunWorkflow,
    SaveWorkflow,
    ListWorkflows,
    DeleteWorkflow,

    // Tabs
    Tabs,
    NewTab,
    CloseTab,
    SwitchTab,

    // Debug
    Screenshot,
    Console,

    // Daemon
    Status,

    // Storage

    // Scripting
    ExecuteJs,
    LocalStorage,
    SessionStorage,
}

impl fmt::Display for Action {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "type", content = "params")]
pub enum Params {
    Open(OpenParams),
    Click(ClickParams),
    Type(TypeParams),
    TypeSecret(TypeParams),
    Fill(FillParams),
    GetText(GetTextParams),
    GetHtml(GetHtmlParams),
    GetValue(GetValueParams),
    GetAttr(GetAttrParams),
    GetCount(GetCountParams),
    ExtractTable(ExtractTableParams),
    IsVisible(IsVisibleParams),
    IsEnabled(IsEnabledParams),
    IsChecked(IsCheckedParams),
    Screenshot(ScreenshotParams),
    Hover(HoverParams),
    Scroll(ScrollParams),
    Check(CheckParams),
    Uncheck(UncheckParams),
    Upload(UploadParams),
    SwitchTab(SwitchTabParams),
    CloseTab(CloseTabParams),
    ExecuteJs(js_executor::ExecuteJsRequest),
    FindElement(element_finder::ElementFinderRequest),
    WaitFor(waits::WaitRequest),
    AddCookie(cookies::AddCookieRequest),
    DeleteCookie(cookies::DeleteCookieRequest),
    AutomatedFill(forms::AutomatedFormFillRequest),
    SetGeolocation(geolocation::SetGeolocationRequest),
    RunWorkflow(workflows::Workflow),
    SaveWorkflow(workflows::Workflow),
    ListWorkflows,
    DeleteWorkflow(DeleteWorkflowParams),
    Empty,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnapshotNode {
    pub ref_id: String,
    #[serde(skip)]
    pub backend_dom_node_id: Option<i32>,
    pub role: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub attributes: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Snapshot {
    pub url: String,
    pub title: String,
    pub nodes: Vec<SnapshotNode>,
}

impl Command {
    pub fn new(action: Action, params: Params, context: Context) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            action,
            params,
            context,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeleteWorkflowParams {
    pub name: String,
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
