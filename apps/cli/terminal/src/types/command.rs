use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq, Hash)]
pub struct CommandId(pub String);

impl CommandId {
    pub fn new() -> Self {
        Self(uuid::Uuid::new_v4().to_string())
    }

    pub fn from_string(id: String) -> Self {
        Self(id)
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl Default for CommandId {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub enum CommandCategory {
    File,
    Edit,
    View,
    Tab,
    Pane,
    Session,
    Settings,
    Help,
    Custom(String),
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct CommandBinding {
    pub id: CommandId,
    pub title: String,
    pub description: String,
    pub category: CommandCategory,
    pub icon: Option<String>,
    pub default_hotkey: Option<String>,
    pub when: Option<String>,
    pub handler: String,
}

impl CommandBinding {
    pub fn new(
        id: CommandId,
        title: String,
        description: String,
        category: CommandCategory,
        handler: String,
    ) -> Self {
        Self {
            id,
            title,
            description,
            category,
            icon: None,
            default_hotkey: None,
            when: None,
            handler,
        }
    }

    pub fn with_hotkey(mut self, hotkey: String) -> Self {
        self.default_hotkey = Some(hotkey);
        self
    }

    pub fn with_icon(mut self, icon: String) -> Self {
        self.icon = Some(icon);
        self
    }

    pub fn with_when(mut self, when: String) -> Self {
        self.when = Some(when);
        self
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct CommandPaletteItem {
    pub command: CommandBinding,
    pub score: f32,
    pub matched_indices: Vec<usize>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct CommandPaletteState {
    pub is_open: bool,
    pub query: String,
    pub items: Vec<CommandPaletteItem>,
    pub selected_index: usize,
    pub context: HashMap<String, String>,
}

impl Default for CommandPaletteState {
    fn default() -> Self {
        Self {
            is_open: false,
            query: String::new(),
            items: vec![],
            selected_index: 0,
            context: HashMap::new(),
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct CommandHistoryEntry {
    pub command: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub working_dir: Option<String>,
    pub exit_code: Option<i32>,
    pub duration_ms: Option<u64>,
    pub session_id: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct CommandHistory {
    pub entries: Vec<CommandHistoryEntry>,
    pub max_entries: usize,
    pub persistent: bool,
}

impl Default for CommandHistory {
    fn default() -> Self {
        Self {
            entries: Vec::new(),
            max_entries: 1000,
            persistent: true,
        }
    }
}

impl CommandHistory {
    pub fn add_entry(&mut self, entry: CommandHistoryEntry) {
        self.entries.push(entry);
        if self.entries.len() > self.max_entries {
            self.entries.remove(0);
        }
    }

    pub fn search(&self, query: &str) -> Vec<&CommandHistoryEntry> {
        let query_lower = query.to_lowercase();
        self.entries
            .iter()
            .filter(|e| e.command.to_lowercase().contains(&query_lower))
            .collect()
    }

    pub fn get_recent(&self, count: usize) -> Vec<&CommandHistoryEntry> {
        self.entries.iter().rev().take(count).collect()
    }

    pub fn clear(&mut self) {
        self.entries.clear();
    }

    pub fn remove_entry(&mut self, timestamp: chrono::DateTime<chrono::Utc>) {
        self.entries.retain(|e| e.timestamp != timestamp);
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct CommandExecution {
    pub command: String,
    pub args: Vec<String>,
    pub working_dir: Option<String>,
    pub env_vars: HashMap<String, String>,
    pub start_time: chrono::DateTime<chrono::Utc>,
    pub end_time: Option<chrono::DateTime<chrono::Utc>>,
    pub exit_code: Option<i32>,
    pub output: Option<String>,
    pub error: Option<String>,
}

impl CommandExecution {
    pub fn new(command: String, args: Vec<String>) -> Self {
        Self {
            command,
            args,
            working_dir: None,
            env_vars: HashMap::new(),
            start_time: chrono::Utc::now(),
            end_time: None,
            exit_code: None,
            output: None,
            error: None,
        }
    }

    pub fn duration_ms(&self) -> Option<u64> {
        self.end_time
            .map(|end| (end - self.start_time).num_milliseconds().max(0) as u64)
    }

    pub fn is_running(&self) -> bool {
        self.end_time.is_none()
    }

    pub fn is_success(&self) -> bool {
        self.exit_code.map_or(false, |code| code == 0)
    }
}
