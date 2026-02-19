//! File watcher event types

use camino::Utf8PathBuf;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// File watcher event types
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum WatchEventType {
    /// File or directory was created
    Created,
    /// File or directory was deleted
    Deleted,
    /// File or directory was modified
    Modified,
    /// File or directory was renamed
    Renamed { from: Utf8PathBuf, to: Utf8PathBuf },
    /// File permissions changed
    PermissionChanged,
    /// File attributes changed
    AttributeChanged,
}

/// File watcher event
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WatchEvent {
    pub path: Utf8PathBuf,
    pub event_type: WatchEventType,
    pub timestamp: DateTime<Utc>,
}

impl WatchEvent {
    /// Create new watch event
    pub fn new(path: Utf8PathBuf, event_type: WatchEventType) -> Self {
        Self {
            path,
            event_type,
            timestamp: Utc::now(),
        }
    }

    /// Create with custom timestamp
    pub fn with_timestamp(mut self, timestamp: DateTime<Utc>) -> Self {
        self.timestamp = timestamp;
        self
    }

    /// Check if this is a create event
    pub fn is_create(&self) -> bool {
        matches!(self.event_type, WatchEventType::Created)
    }

    /// Check if this is a delete event
    pub fn is_delete(&self) -> bool {
        matches!(self.event_type, WatchEventType::Deleted)
    }

    /// Check if this is a modify event
    pub fn is_modify(&self) -> bool {
        matches!(self.event_type, WatchEventType::Modified)
    }

    /// Check if this is a rename event
    pub fn is_rename(&self) -> bool {
        matches!(self.event_type, WatchEventType::Renamed { .. })
    }

    /// Get the old path for rename events
    pub fn old_path(&self) -> Option<&Utf8PathBuf> {
        match &self.event_type {
            WatchEventType::Renamed { from, .. } => Some(from),
            _ => None,
        }
    }

    /// Get the new path for rename events
    pub fn new_path(&self) -> Option<&Utf8PathBuf> {
        match &self.event_type {
            WatchEventType::Renamed { to, .. } => Some(to),
            _ => None,
        }
    }

    /// Get event description
    pub fn description(&self) -> String {
        match &self.event_type {
            WatchEventType::Created => format!("Created: {}", self.path),
            WatchEventType::Deleted => format!("Deleted: {}", self.path),
            WatchEventType::Modified => format!("Modified: {}", self.path),
            WatchEventType::Renamed { from, to } => format!("Renamed: {} -> {}", from, to),
            WatchEventType::PermissionChanged => format!("Permission changed: {}", self.path),
            WatchEventType::AttributeChanged => format!("Attributes changed: {}", self.path),
        }
    }

    /// Get event type as string
    pub fn event_type_string(&self) -> &'static str {
        match &self.event_type {
            WatchEventType::Created => "created",
            WatchEventType::Deleted => "deleted",
            WatchEventType::Modified => "modified",
            WatchEventType::Renamed { .. } => "renamed",
            WatchEventType::PermissionChanged => "permission_changed",
            WatchEventType::AttributeChanged => "attribute_changed",
        }
    }
}

/// Event filter
pub struct EventFilter {
    include_patterns: Vec<String>,
    exclude_patterns: Vec<String>,
    event_types: Vec<WatchEventType>,
}

impl EventFilter {
    /// Create new event filter
    pub fn new() -> Self {
        Self {
            include_patterns: Vec::new(),
            exclude_patterns: Vec::new(),
            event_types: Vec::new(),
        }
    }

    /// Add include pattern (glob pattern)
    pub fn include_pattern(mut self, pattern: String) -> Self {
        self.include_patterns.push(pattern);
        self
    }

    /// Add exclude pattern (glob pattern)
    pub fn exclude_pattern(mut self, pattern: String) -> Self {
        self.exclude_patterns.push(pattern);
        self
    }

    /// Add event type filter
    pub fn event_type(mut self, event_type: WatchEventType) -> Self {
        self.event_types.push(event_type);
        self
    }

    /// Check if event matches filter
    pub fn matches(&self, event: &WatchEvent) -> bool {
        // Check event type filter
        if !self.event_types.is_empty() && !self.event_types.contains(&event.event_type) {
            return false;
        }

        let path_str = event.path.as_str();

        // Check exclude patterns
        for pattern in &self.exclude_patterns {
            if let Ok(glob_pattern) = glob::Pattern::new(pattern) {
                if glob_pattern.matches(path_str) {
                    return false;
                }
            }
        }

        // Check include patterns
        if !self.include_patterns.is_empty() {
            for pattern in &self.include_patterns {
                if let Ok(glob_pattern) = glob::Pattern::new(pattern) {
                    if glob_pattern.matches(path_str) {
                        return true;
                    }
                }
            }
            return false;
        }

        true
    }
}

impl Default for EventFilter {
    fn default() -> Self {
        Self::new()
    }
}

/// Event aggregator for debouncing multiple events
pub struct EventAggregator {
    debounce_ms: u64,
    pending_events: std::collections::HashMap<Utf8PathBuf, WatchEvent>,
}

impl EventAggregator {
    /// Create new event aggregator
    pub fn new(debounce_ms: u64) -> Self {
        Self {
            debounce_ms,
            pending_events: std::collections::HashMap::new(),
        }
    }

    /// Add event to aggregator
    pub fn add_event(&mut self, event: WatchEvent) -> Vec<WatchEvent> {
        let mut result = Vec::new();

        // Check if we have a pending event for this path
        if let Some(pending) = self.pending_events.get_mut(&event.path) {
            // Update pending event based on new event
            match (&pending.event_type, &event.event_type) {
                (WatchEventType::Created, WatchEventType::Deleted) => {
                    // Created then deleted = no net change
                    self.pending_events.remove(&event.path);
                }
                (WatchEventType::Created, WatchEventType::Modified) => {
                    // Keep as created
                    *pending = event;
                }
                (WatchEventType::Modified, WatchEventType::Modified) => {
                    // Keep latest modification
                    *pending = event;
                }
                (WatchEventType::Deleted, WatchEventType::Created) => {
                    // Deleted then created = modified
                    pending.event_type = WatchEventType::Modified;
                    pending.timestamp = event.timestamp;
                }
                _ => {
                    // Other combinations - keep latest
                    *pending = event;
                }
            }
        } else {
            // No pending event, add this one
            self.pending_events.insert(event.path.clone(), event);
        }

        result
    }

    /// Get all pending events and clear them
    pub fn flush(&mut self) -> Vec<WatchEvent> {
        let events: Vec<_> = self.pending_events.values().cloned().collect();
        self.pending_events.clear();
        events
    }

    /// Check if there are pending events
    pub fn has_pending(&self) -> bool {
        !self.pending_events.is_empty()
    }

    /// Get count of pending events
    pub fn pending_count(&self) -> usize {
        self.pending_events.len()
    }
}
