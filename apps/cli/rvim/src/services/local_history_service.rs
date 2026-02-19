use anyhow::Result;
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

// Represents a single snapshot in the local history.
#[derive(Debug, Clone)]
pub struct HistoryEntry {
    pub timestamp: u64,
    pub content: String,
}

// Manages local history for files.
pub struct LocalHistoryService {
    // Maps file paths to their history entries.
    history: HashMap<PathBuf, Vec<HistoryEntry>>,
}

impl Default for LocalHistoryService {
    fn default() -> Self {
        Self::new()
    }
}

impl LocalHistoryService {
    pub fn new() -> Self {
        Self {
            history: HashMap::new(),
        }
    }

    pub fn record_change(&mut self, file_path: &Path, content: &str) {
        let entry = HistoryEntry {
            timestamp: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            content: content.to_string(),
        };

        self.history
            .entry(file_path.to_path_buf())
            .or_default()
            .push(entry);
        tracing::info!(
            "Recorded local history snapshot for '{}'",
            file_path.display()
        );
    }

    pub fn get_history(&self, file_path: &Path) -> Option<&Vec<HistoryEntry>> {
        self.history.get(file_path)
    }
}
