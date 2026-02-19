//! Event types for inter-extension communication

use crate::types::id::{CommandId, ExtensionId};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Core extension events
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ExtensionEvent {
    /// Fired when a file is changed
    FileChanged { path: String },

    /// Fired when a command is executed
    CommandExecuted { command_id: CommandId },

    /// Fired when a setting is changed
    SettingChanged {
        key: String,
        value: serde_json::Value,
    },

    /// Fired when an extension is activated
    ExtensionActivated { extension_id: ExtensionId },

    /// Fired when an extension is deactivated
    ExtensionDeactivated { extension_id: ExtensionId },

    /// Fired when an extension is loaded
    ExtensionLoaded { extension_id: ExtensionId },

    /// Fired when an extension is unloaded
    ExtensionUnloaded { extension_id: ExtensionId },

    /// Fired when a WebView is created
    WebViewCreated { webview_id: String },

    /// Fired when a WebView is closed
    WebViewClosed { webview_id: String },

    /// Fired when a WebView sends a message
    WebViewMessage {
        webview_id: String,
        message: serde_json::Value,
    },

    /// Custom event with arbitrary data
    Custom {
        event_type: String,
        data: serde_json::Value,
    },
}

impl ExtensionEvent {
    /// Returns the event type name
    pub fn event_type(&self) -> &str {
        match self {
            ExtensionEvent::FileChanged { .. } => "file_changed",
            ExtensionEvent::CommandExecuted { .. } => "command_executed",
            ExtensionEvent::SettingChanged { .. } => "setting_changed",
            ExtensionEvent::ExtensionActivated { .. } => "extension_activated",
            ExtensionEvent::ExtensionDeactivated { .. } => "extension_deactivated",
            ExtensionEvent::ExtensionLoaded { .. } => "extension_loaded",
            ExtensionEvent::ExtensionUnloaded { .. } => "extension_unloaded",
            ExtensionEvent::WebViewCreated { .. } => "webview_created",
            ExtensionEvent::WebViewClosed { .. } => "webview_closed",
            ExtensionEvent::WebViewMessage { .. } => "webview_message",
            ExtensionEvent::Custom { event_type, .. } => event_type,
        }
    }

    /// Returns metadata about the event
    pub fn metadata(&self) -> HashMap<String, String> {
        let mut metadata = HashMap::new();
        metadata.insert("event_type".to_string(), self.event_type().to_string());

        match self {
            ExtensionEvent::FileChanged { path } => {
                metadata.insert("path".to_string(), path.clone());
            }
            ExtensionEvent::CommandExecuted { command_id } => {
                metadata.insert("command_id".to_string(), command_id.to_string());
            }
            ExtensionEvent::SettingChanged { key, .. } => {
                metadata.insert("key".to_string(), key.clone());
            }
            ExtensionEvent::ExtensionActivated { extension_id }
            | ExtensionEvent::ExtensionDeactivated { extension_id }
            | ExtensionEvent::ExtensionLoaded { extension_id }
            | ExtensionEvent::ExtensionUnloaded { extension_id } => {
                metadata.insert("extension_id".to_string(), extension_id.to_string());
            }
            ExtensionEvent::WebViewCreated { webview_id }
            | ExtensionEvent::WebViewClosed { webview_id }
            | ExtensionEvent::WebViewMessage { webview_id, .. } => {
                metadata.insert("webview_id".to_string(), webview_id.clone());
            }
            ExtensionEvent::Custom { event_type, .. } => {
                metadata.insert("custom_type".to_string(), event_type.clone());
            }
        }

        metadata
    }
}

/// Trait for event listeners
pub trait EventListener: Send + Sync {
    /// Called when an event is dispatched
    fn on_event(&self, event: ExtensionEvent);
}

/// Event filter for selective listening
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventFilter {
    /// Event types to listen to (empty = all)
    pub event_types: Vec<String>,

    /// Extension IDs to filter by (empty = all)
    pub extension_ids: Vec<ExtensionId>,

    /// Custom filter criteria
    pub custom_filters: HashMap<String, String>,
}

impl EventFilter {
    /// Creates a new event filter
    pub fn new() -> Self {
        Self {
            event_types: Vec::new(),
            extension_ids: Vec::new(),
            custom_filters: HashMap::new(),
        }
    }

    /// Adds an event type to the filter
    pub fn with_event_type(mut self, event_type: impl Into<String>) -> Self {
        self.event_types.push(event_type.into());
        self
    }

    /// Adds an extension ID to the filter
    pub fn with_extension_id(mut self, extension_id: ExtensionId) -> Self {
        self.extension_ids.push(extension_id);
        self
    }

    /// Checks if an event matches the filter
    pub fn matches(&self, event: &ExtensionEvent) -> bool {
        // Check event type
        if !self.event_types.is_empty()
            && !self.event_types.contains(&event.event_type().to_string())
        {
            return false;
        }

        // Note: Extension ID filtering would need to be added to event metadata
        // For now, we'll skip this check

        true
    }
}

impl Default for EventFilter {
    fn default() -> Self {
        Self::new()
    }
}
