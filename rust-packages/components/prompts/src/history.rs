use crate::error::{Error, Result};
use std::collections::VecDeque;
use std::fs::{self, File};
use std::io::{BufRead, BufReader, Write};
use std::path::PathBuf;

/// Session history for undo/redo support
pub struct History<T> {
    entries: VecDeque<T>,
    current: usize,
    capacity: usize,
    file_path: Option<PathBuf>,
}

impl<T: Clone> History<T> {
    /// Create new history with capacity
    pub fn new(capacity: usize) -> Self {
        Self {
            entries: VecDeque::with_capacity(capacity),
            current: 0,
            capacity,
            file_path: None,
        }
    }

    /// Enable persistence to file
    pub fn with_persistence(mut self, path: impl Into<PathBuf>) -> Self {
        self.file_path = Some(path.into());
        self
    }

    /// Add entry to history
    pub fn push(&mut self, entry: T) {
        // Remove entries after current position (redo history)
        while self.entries.len() > self.current {
            self.entries.pop_back();
        }

        // Add new entry
        if self.entries.len() >= self.capacity {
            self.entries.pop_front();
        } else {
            self.current += 1;
        }
        self.entries.push_back(entry);
    }

    /// Undo: go back one step
    pub fn undo(&mut self) -> Option<&T> {
        if self.current > 0 {
            self.current -= 1;
            self.entries.get(self.current)
        } else {
            None
        }
    }

    /// Redo: go forward one step
    pub fn redo(&mut self) -> Option<&T> {
        if self.current < self.entries.len() {
            let entry = self.entries.get(self.current);
            self.current += 1;
            entry
        } else {
            None
        }
    }

    /// Get current entry
    pub fn current(&self) -> Option<&T> {
        if self.current > 0 {
            self.entries.get(self.current - 1)
        } else {
            None
        }
    }

    /// Can undo?
    pub fn can_undo(&self) -> bool {
        self.current > 0
    }

    /// Can redo?
    pub fn can_redo(&self) -> bool {
        self.current < self.entries.len()
    }

    /// Clear history
    pub fn clear(&mut self) {
        self.entries.clear();
        self.current = 0;
    }

    /// Get all entries
    pub fn entries(&self) -> &VecDeque<T> {
        &self.entries
    }

    /// Load from file
    pub fn load(&mut self) -> Result<()>
    where
        T: serde::de::DeserializeOwned,
    {
        if let Some(path) = &self.file_path {
            if path.exists() {
                let file = File::open(path)?;
                let reader = BufReader::new(file);
                for line in reader.lines() {
                    let line = line?;
                    if let Ok(entry) = serde_json::from_str::<T>(&line) {
                        self.push(entry);
                    }
                }
            }
        }
        Ok(())
    }

    /// Save to file
    pub fn save(&self) -> Result<()>
    where
        T: serde::Serialize,
    {
        if let Some(path) = &self.file_path {
            if let Some(parent) = path.parent() {
                fs::create_dir_all(parent)?;
            }
            let mut file = File::create(path)?;
            for entry in &self.entries {
                let json = serde_json::to_string(entry)?;
                writeln!(file, "{}", json)?;
            }
        }
        Ok(())
    }
}

/// Shared history manager for input fields
pub struct InputHistory {
    history: History<String>,
    search_index: Option<usize>,
    search_prefix: String,
}

impl InputHistory {
    pub fn new(capacity: usize) -> Self {
        Self {
            history: History::new(capacity),
            search_index: None,
            search_prefix: String::new(),
        }
    }

    /// Add entry
    pub fn add(&mut self, entry: String) {
        // Don't add empty or duplicate entries
        if !entry.trim().is_empty() && self.history.current() != Some(&entry) {
            self.history.push(entry);
        }
    }

    /// Navigate history up (older entries)
    pub fn prev(&mut self) -> Option<&String> {
        self.history.undo()
    }

    /// Navigate history down (newer entries)
    pub fn next(&mut self) -> Option<&String> {
        self.history.redo()
    }

    /// Search history with prefix
    pub fn search(&mut self, prefix: &str) -> Option<&String> {
        self.search_prefix = prefix.to_string();
        self.search_index = None;

        for (i, entry) in self.history.entries().iter().enumerate().rev() {
            if entry.starts_with(prefix) {
                self.search_index = Some(i);
                return Some(entry);
            }
        }
        None
    }

    /// Get next search result
    pub fn search_next(&mut self) -> Option<&String> {
        if let Some(current) = self.search_index {
            for (i, entry) in self.history.entries().iter().enumerate().rev() {
                if i < current && entry.starts_with(&self.search_prefix) {
                    self.search_index = Some(i);
                    return Some(entry);
                }
            }
        }
        None
    }

    /// Get current input (from history or empty)
    pub fn current(&self) -> Option<&String> {
        self.history.current()
    }

    /// Reset to end of history
    pub fn reset(&mut self) {
        while self.history.redo().is_some() {}
    }
}
