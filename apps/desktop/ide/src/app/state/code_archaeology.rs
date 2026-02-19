use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeTimelineEvent {
    pub commit_hash: String,
    pub timestamp: String,
    pub author: String,
    pub message: String,
    pub file_path: String,
    pub line_range: (usize, usize),
    pub change_type: ChangeType,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ChangeType {
    Added,
    Modified,
    Deleted,
    Moved,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeSnapshot {
    pub commit_hash: String,
    pub timestamp: String,
    pub content: String,
    pub line_numbers: Vec<usize>,
}

#[derive(Debug, Clone, Default)]
pub struct CodeArchaeologyState {
    pub timeline_events: Vec<CodeTimelineEvent>,
    pub snapshots: Vec<CodeSnapshot>,
    pub current_position: usize,
    pub selected_file: Option<String>,
    pub show_timeline: bool,
    pub show_snapshots: bool,
}

impl CodeArchaeologyState {
    pub fn new() -> Self {
        Self {
            timeline_events: Vec::new(),
            snapshots: Vec::new(),
            current_position: 0,
            selected_file: None,
            show_timeline: true,
            show_snapshots: true,
        }
    }

    pub fn load_history(&mut self, file_path: &str) {
        self.selected_file = Some(file_path.to_string());
        self.timeline_events.clear();
        self.snapshots.clear();
        self.current_position = 0;
    }

    pub fn add_event(&mut self, event: CodeTimelineEvent) {
        self.timeline_events.push(event);
    }

    pub fn add_snapshot(&mut self, snapshot: CodeSnapshot) {
        self.snapshots.push(snapshot);
    }

    pub fn move_to_position(&mut self, position: usize) {
        if position < self.snapshots.len() {
            self.current_position = position;
        }
    }

    pub fn get_current_snapshot(&self) -> Option<&CodeSnapshot> {
        if self.current_position < self.snapshots.len() {
            Some(&self.snapshots[self.current_position])
        } else {
            None
        }
    }

    pub fn get_events_for_file(&self, file_path: &str) -> Vec<&CodeTimelineEvent> {
        self.timeline_events
            .iter()
            .filter(|e| e.file_path == file_path)
            .collect()
    }

    pub fn scrub_to_commit(&mut self, commit_hash: &str) {
        if let Some(pos) = self.snapshots.iter().position(|s| s.commit_hash == commit_hash) {
            self.current_position = pos;
        }
    }
}
