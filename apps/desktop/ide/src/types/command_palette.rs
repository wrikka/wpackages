//! Command palette types

use serde::{Deserialize, Serialize};

/// Command palette item
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaletteItem {
    pub id: String,
    pub label: String,
    pub description: Option<String>,
    pub category: CommandCategory,
    pub shortcut: Option<String>,
    pub action: CommandAction,
}

/// Command category
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum CommandCategory {
    File,
    Edit,
    View,
    Navigation,
    Git,
    Terminal,
    Help,
    Custom(String),
}

/// Command action
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CommandAction {
    /// Open a file
    OpenFile { path: String },
    /// Save a file
    SaveFile,
    /// Close a file
    CloseFile,
    /// Navigate to a line
    GoToLine { line: usize },
    /// Search in files
    SearchInFiles,
    /// Open terminal
    OpenTerminal,
    /// Run git command
    GitCommand { command: String },
    /// Custom action
    Custom { name: String, params: serde_json::Value },
}

/// Command palette state
#[derive(Debug, Clone, Default)]
pub struct CommandPaletteState {
    pub visible: bool,
    pub query: String,
    pub items: Vec<PaletteItem>,
    pub selected_index: usize,
    pub filtered_items: Vec<PaletteItem>,
}

impl CommandPaletteState {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn show(&mut self) {
        self.visible = true;
        self.query.clear();
        self.selected_index = 0;
        self.filtered_items = self.items.clone();
    }

    pub fn hide(&mut self) {
        self.visible = false;
        self.query.clear();
        self.selected_index = 0;
    }

    pub fn update_query(&mut self, query: String) {
        self.query = query.clone();
        self.filtered_items = self
            .items
            .iter()
            .filter(|item| {
                let query_lower = query.to_lowercase();
                item.label.to_lowercase().contains(&query_lower)
                    || item
                        .description
                        .as_ref()
                        .map(|d| d.to_lowercase().contains(&query_lower))
                        .unwrap_or(false)
            })
            .cloned()
            .collect();
        self.selected_index = 0;
    }

    pub fn select_next(&mut self) {
        if !self.filtered_items.is_empty() {
            self.selected_index = (self.selected_index + 1) % self.filtered_items.len();
        }
    }

    pub fn select_previous(&mut self) {
        if !self.filtered_items.is_empty() {
            self.selected_index = if self.selected_index == 0 {
                self.filtered_items.len() - 1
            } else {
                self.selected_index - 1
            };
        }
    }

    pub fn get_selected(&self) -> Option<&PaletteItem> {
        self.filtered_items.get(self.selected_index)
    }
}
