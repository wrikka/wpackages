//! Additional UI contribution points (TreeView, ActivityBar, ContextMenu)

use crate::types::id::CommandId;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Tree view item for hierarchical data display
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TreeViewItem {
    /// Unique identifier for this item
    pub id: String,

    /// Display label
    pub label: String,

    /// Optional icon
    pub icon: Option<String>,

    /// Child items
    pub children: Vec<TreeViewItem>,

    /// Command to execute when clicked
    pub command: Option<CommandId>,

    /// Whether this item can be collapsed
    pub collapsible: bool,

    /// Whether this item is expanded
    pub expanded: bool,

    /// Additional metadata
    pub metadata: HashMap<String, String>,
}

impl TreeViewItem {
    /// Creates a new tree view item
    pub fn new(id: impl Into<String>, label: impl Into<String>) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            icon: None,
            children: Vec::new(),
            command: None,
            collapsible: false,
            expanded: false,
            metadata: HashMap::new(),
        }
    }

    /// Sets the icon
    pub fn with_icon(mut self, icon: impl Into<String>) -> Self {
        self.icon = Some(icon.into());
        self
    }

    /// Adds a child item
    pub fn with_child(mut self, child: TreeViewItem) -> Self {
        self.children.push(child);
        self.collapsible = true;
        self
    }

    /// Sets the command
    pub fn with_command(mut self, command: CommandId) -> Self {
        self.command = Some(command);
        self
    }

    /// Sets whether the item is collapsible
    pub fn with_collapsible(mut self, collapsible: bool) -> Self {
        self.collapsible = collapsible;
        self
    }

    /// Sets whether the item is expanded
    pub fn with_expanded(mut self, expanded: bool) -> Self {
        self.expanded = expanded;
        self
    }

    /// Adds metadata
    pub fn with_metadata(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.metadata.insert(key.into(), value.into());
        self
    }
}

/// Activity bar item for side navigation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActivityBarItem {
    /// Unique identifier for this item
    pub id: String,

    /// Display label
    pub label: String,

    /// Icon to display
    pub icon: String,

    /// Command to execute when clicked
    pub command: CommandId,

    /// Tooltip to show on hover
    pub tooltip: Option<String>,

    /// Whether this item is active
    pub active: bool,

    /// Badge count (optional)
    pub badge: Option<u32>,
}

impl ActivityBarItem {
    /// Creates a new activity bar item
    pub fn new(
        id: impl Into<String>,
        label: impl Into<String>,
        icon: impl Into<String>,
        command: CommandId,
    ) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            icon: icon.into(),
            command,
            tooltip: None,
            active: false,
            badge: None,
        }
    }

    /// Sets the tooltip
    pub fn with_tooltip(mut self, tooltip: impl Into<String>) -> Self {
        self.tooltip = Some(tooltip.into());
        self
    }

    /// Sets whether the item is active
    pub fn with_active(mut self, active: bool) -> Self {
        self.active = active;
        self
    }

    /// Sets the badge count
    pub fn with_badge(mut self, badge: u32) -> Self {
        self.badge = Some(badge);
        self
    }
}

/// Context menu item
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextMenuItem {
    /// Unique identifier for this item
    pub id: String,

    /// Display label
    pub label: String,

    /// Icon (optional)
    pub icon: Option<String>,

    /// Command to execute when clicked
    pub command: Option<CommandId>,

    /// Submenu items
    pub submenu: Vec<ContextMenuItem>,

    /// Whether this item is a separator
    pub separator: bool,

    /// Whether this item is enabled
    pub enabled: bool,

    /// Whether this item is visible
    pub visible: bool,

    /// Keyboard shortcut
    pub shortcut: Option<String>,
}

impl ContextMenuItem {
    /// Creates a new context menu item
    pub fn new(id: impl Into<String>, label: impl Into<String>) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            icon: None,
            command: None,
            submenu: Vec::new(),
            separator: false,
            enabled: true,
            visible: true,
            shortcut: None,
        }
    }

    /// Creates a separator
    pub fn separator() -> Self {
        Self {
            id: String::new(),
            label: String::new(),
            icon: None,
            command: None,
            submenu: Vec::new(),
            separator: true,
            enabled: true,
            visible: true,
            shortcut: None,
        }
    }

    /// Sets the icon
    pub fn with_icon(mut self, icon: impl Into<String>) -> Self {
        self.icon = Some(icon.into());
        self
    }

    /// Sets the command
    pub fn with_command(mut self, command: CommandId) -> Self {
        self.command = Some(command);
        self
    }

    /// Adds a submenu item
    pub fn with_submenu_item(mut self, item: ContextMenuItem) -> Self {
        self.submenu.push(item);
        self
    }

    /// Sets whether the item is enabled
    pub fn with_enabled(mut self, enabled: bool) -> Self {
        self.enabled = enabled;
        self
    }

    /// Sets whether the item is visible
    pub fn with_visible(mut self, visible: bool) -> Self {
        self.visible = visible;
        self
    }

    /// Sets the keyboard shortcut
    pub fn with_shortcut(mut self, shortcut: impl Into<String>) -> Self {
        self.shortcut = Some(shortcut.into());
        self
    }
}

/// Tree view data provider trait
pub trait TreeViewProvider: Send + Sync {
    /// Returns the root items for the tree view
    fn get_root_items(&self) -> Vec<TreeViewItem>;

    /// Returns children for a given item
    fn get_children(&self, item_id: &str) -> Vec<TreeViewItem>;

    /// Called when an item is expanded
    fn on_expand(&self, item_id: &str);

    /// Called when an item is collapsed
    fn on_collapse(&self, item_id: &str);
}

/// Activity bar data provider trait
pub trait ActivityBarProvider: Send + Sync {
    /// Returns all activity bar items
    fn get_items(&self) -> Vec<ActivityBarItem>;

    /// Called when an item is clicked
    fn on_click(&self, item_id: &str);
}

/// Context menu data provider trait
pub trait ContextMenuProvider: Send + Sync {
    /// Returns context menu items for a given context
    fn get_items(&self, context: &str) -> Vec<ContextMenuItem>;

    /// Called when an item is clicked
    fn on_click(&self, item_id: &str);
}
