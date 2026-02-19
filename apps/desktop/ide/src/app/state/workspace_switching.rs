use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceSnapshot {
    pub id: String,
    pub name: String,
    pub path: PathBuf,
    pub created_at: DateTime<Utc>,
    pub open_files: Vec<OpenFileState>,
    pub active_file: Option<String>,
    pub scroll_positions: HashMap<String, f32>,
    pub cursor_positions: HashMap<String, (usize, usize)>,
    pub search_history: Vec<String>,
    pub branch_state: Option<String>,
    pub panel_layout: PanelLayout,
    pub terminal_sessions: Vec<TerminalSessionState>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenFileState {
    pub path: String,
    pub language: String,
    pub scroll_position: f32,
    pub cursor_position: (usize, usize),
    pub selection: Option<(usize, usize, usize, usize)>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TerminalSessionState {
    pub id: u32,
    pub working_dir: PathBuf,
    pub command_history: Vec<String>,
    pub scrollback: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PanelLayout {
    pub left_panel_visible: bool,
    pub right_panel_visible: bool,
    pub bottom_panel_visible: bool,
    pub left_panel_width: f32,
    pub right_panel_width: f32,
    pub bottom_panel_height: f32,
}

#[derive(Debug, Clone, Default)]
pub struct WorkspaceSwitchingState {
    pub snapshots: Vec<WorkspaceSnapshot>,
    pub current_snapshot_id: Option<String>,
    pub auto_save_enabled: bool,
    pub max_snapshots: usize,
}

impl WorkspaceSwitchingState {
    pub fn new() -> Self {
        Self {
            snapshots: Vec::new(),
            current_snapshot_id: None,
            auto_save_enabled: true,
            max_snapshots: 10,
        }
    }

    pub fn save_snapshot(&mut self, snapshot: WorkspaceSnapshot) {
        self.sessions_cleanup();
        self.current_snapshot_id = Some(snapshot.id.clone());
        self.snapshots.push(snapshot);
    }

    pub fn load_snapshot(&mut self, id: &str) -> Option<&WorkspaceSnapshot> {
        self.current_snapshot_id = Some(id.to_string());
        self.snapshots.iter().find(|s| s.id == id)
    }

    pub fn remove_snapshot(&mut self, id: &str) {
        self.snapshots.retain(|s| s.id != id);
    }

    fn sessions_cleanup(&mut self) {
        if self.snapshots.len() >= self.max_snapshots {
            self.snapshots.remove(0);
        }
    }

    pub fn get_current_snapshot(&self) -> Option<&WorkspaceSnapshot> {
        self.current_snapshot_id.as_ref()
            .and_then(|id| self.snapshots.iter().find(|s| s.id == id))
    }
}
