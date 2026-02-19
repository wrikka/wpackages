//! Integration tests for UiRegistry.

use extensions::services::ui_service::{UiRegistry, TreeViewProvider, TreeViewItem};
use extensions::types::ui::{StatusBarItem, UiContributionPoint};
use extensions::types::contributions::{
    ActivityBarItem, ActivityBarProvider, ContextMenuItem, ContextMenuProvider,
};
use extensions::types::id::CommandId;
use std::sync::Arc;

struct MockTreeViewProvider {
    root_items: Vec<TreeViewItem>,
}

impl MockTreeViewProvider {
    fn new(items: Vec<TreeViewItem>) -> Self {
        Self { root_items: items }
    }
}

impl TreeViewProvider for MockTreeViewProvider {
    fn get_root_items(&self) -> Vec<TreeViewItem> {
        self.root_items.clone()
    }

    fn get_children(&self, _item_id: &str) -> Vec<TreeViewItem> {
        vec![]
    }

    fn on_expand(&self, _item_id: &str) {}

    fn on_collapse(&self, _item_id: &str) {}
}

struct MockActivityBarProvider {
    items: Vec<ActivityBarItem>,
}

impl MockActivityBarProvider {
    fn new(items: Vec<ActivityBarItem>) -> Self {
        Self { items }
    }
}

impl ActivityBarProvider for MockActivityBarProvider {
    fn get_items(&self) -> Vec<ActivityBarItem> {
        self.items.clone()
    }

    fn on_click(&self, _item_id: &str) {}
}

struct MockContextMenuProvider {
    items: Vec<ContextMenuItem>,
}

impl MockContextMenuProvider {
    fn new(items: Vec<ContextMenuItem>) -> Self {
        Self { items }
    }
}

impl ContextMenuProvider for MockContextMenuProvider {
    fn get_items(&self, _context: &str) -> Vec<ContextMenuItem> {
        self.items.clone()
    }

    fn on_click(&self, _item_id: &str) {}
}

#[test]
fn test_ui_registry_initialization() {
    let registry = UiRegistry::new();
    assert_eq!(registry.get_status_bar_items(UiContributionPoint::Left).len(), 0);
}

#[test]
fn test_register_status_bar_item() {
    let registry = UiRegistry::new();

    let item = StatusBarItem {
        id: "test_item".to_string(),
        text: "Test".to_string(),
        tooltip: None,
        command: None,
        priority: 0,
    };

    registry.register_status_bar_item(UiContributionPoint::Left, item);

    let items = registry.get_status_bar_items(UiContributionPoint::Left);
    assert_eq!(items.len(), 1);
    assert_eq!(items[0].id, "test_item");
}

#[test]
fn test_register_tree_view_provider() {
    let registry = UiRegistry::new();

    let item = TreeViewItem::new("root", "Root");
    let provider = Arc::new(MockTreeViewProvider::new(vec![item]));

    registry.register_tree_view_provider("test_view", provider);

    let items = registry.get_tree_view_root_items("test_view");
    assert_eq!(items.len(), 1);
    assert_eq!(items[0].id, "root");
}

#[test]
fn test_get_tree_view_provider() {
    let registry = UiRegistry::new();

    let item = TreeViewItem::new("root", "Root");
    let provider = Arc::new(MockTreeViewProvider::new(vec![item]));

    registry.register_tree_view_provider("test_view", provider.clone());

    let retrieved = registry.get_tree_view_provider("test_view");
    assert!(retrieved.is_some());
}

#[test]
fn test_register_activity_bar_provider() {
    let registry = UiRegistry::new();

    let item = ActivityBarItem::new(
        "test_item",
        "Test",
        "icon",
        CommandId::new("test.command"),
    );

    let provider = Arc::new(MockActivityBarProvider::new(vec![item]));

    registry.register_activity_bar_provider("test_provider", provider);

    let items = registry.get_activity_bar_items();
    assert_eq!(items.len(), 1);
    assert_eq!(items[0].id, "test_item");
}

#[test]
fn test_register_context_menu_provider() {
    let registry = UiRegistry::new();

    let item = ContextMenuItem::new("test_item", "Test");
    let provider = Arc::new(MockContextMenuProvider::new(vec![item]));

    registry.register_context_menu_provider("test_provider", provider);

    let items = registry.get_context_menu_items("test_context");
    assert_eq!(items.len(), 1);
    assert_eq!(items[0].id, "test_item");
}

#[test]
fn test_clear_all() {
    let registry = UiRegistry::new();

    // Register some items
    let status_item = StatusBarItem {
        id: "test_item".to_string(),
        text: "Test".to_string(),
        tooltip: None,
        command: None,
        priority: 0,
    };
    registry.register_status_bar_item(UiContributionPoint::Left, status_item);

    let tree_item = TreeViewItem::new("root", "Root");
    let tree_provider = Arc::new(MockTreeViewProvider::new(vec![tree_item]));
    registry.register_tree_view_provider("test_view", tree_provider);

    // Clear all
    registry.clear_all();

    // Verify everything is cleared
    assert_eq!(registry.get_status_bar_items(UiContributionPoint::Left).len(), 0);
    assert_eq!(registry.get_tree_view_root_items("test_view").len(), 0);
}
