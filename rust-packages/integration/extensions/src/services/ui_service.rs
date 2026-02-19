use crate::types::contributions::{
    ActivityBarItem, ActivityBarProvider, ContextMenuItem, ContextMenuProvider, TreeViewItem,
    TreeViewProvider,
};
use crate::types::ui::{StatusBarItem, UiContributionPoint};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

/// A thread-safe registry for all UI contributions from extensions.
#[derive(Clone, Default)]
pub struct UiRegistry {
    inner: Arc<Mutex<RegistryInner>>,
}

#[derive(Default)]
struct RegistryInner {
    status_bar_items: HashMap<UiContributionPoint, Vec<StatusBarItem>>,
    tree_view_providers: HashMap<String, Arc<dyn TreeViewProvider>>,
    activity_bar_providers: HashMap<String, Arc<dyn ActivityBarProvider>>,
    context_menu_providers: HashMap<String, Arc<dyn ContextMenuProvider>>,
}

impl UiRegistry {
    pub fn new() -> Self {
        Self::default()
    }

    /// Registers a new status bar item at a specific location.
    pub fn register_status_bar_item(&self, location: UiContributionPoint, item: StatusBarItem) {
        let mut inner = self.inner.lock().unwrap();
        inner
            .status_bar_items
            .entry(location)
            .or_default()
            .push(item);
    }

    /// Returns all registered status bar items for a given location.
    pub fn get_status_bar_items(&self, location: UiContributionPoint) -> Vec<StatusBarItem> {
        let inner = self.inner.lock().unwrap();
        inner
            .status_bar_items
            .get(&location)
            .cloned()
            .unwrap_or_default()
    }

    /// Registers a tree view provider.
    pub fn register_tree_view_provider(
        &self,
        view_id: impl Into<String>,
        provider: Arc<dyn TreeViewProvider>,
    ) {
        let mut inner = self.inner.lock().unwrap();
        inner.tree_view_providers.insert(view_id.into(), provider);
    }

    /// Gets a tree view provider by ID.
    pub fn get_tree_view_provider(&self, view_id: &str) -> Option<Arc<dyn TreeViewProvider>> {
        let inner = self.inner.lock().unwrap();
        inner.tree_view_providers.get(view_id).cloned()
    }

    /// Gets root items from a tree view provider.
    pub fn get_tree_view_root_items(&self, view_id: &str) -> Vec<TreeViewItem> {
        let inner = self.inner.lock().unwrap();
        inner
            .tree_view_providers
            .get(view_id)
            .map(|p| p.get_root_items())
            .unwrap_or_default()
    }

    /// Gets children from a tree view provider.
    pub fn get_tree_view_children(&self, view_id: &str, item_id: &str) -> Vec<TreeViewItem> {
        let inner = self.inner.lock().unwrap();
        inner
            .tree_view_providers
            .get(view_id)
            .map(|p| p.get_children(item_id))
            .unwrap_or_default()
    }

    /// Notifies a tree view provider that an item was expanded.
    pub fn notify_tree_view_expanded(&self, view_id: &str, item_id: &str) {
        let inner = self.inner.lock().unwrap();
        if let Some(provider) = inner.tree_view_providers.get(view_id) {
            provider.on_expand(item_id);
        }
    }

    /// Notifies a tree view provider that an item was collapsed.
    pub fn notify_tree_view_collapsed(&self, view_id: &str, item_id: &str) {
        let inner = self.inner.lock().unwrap();
        if let Some(provider) = inner.tree_view_providers.get(view_id) {
            provider.on_collapse(item_id);
        }
    }

    /// Registers an activity bar provider.
    pub fn register_activity_bar_provider(
        &self,
        provider_id: impl Into<String>,
        provider: Arc<dyn ActivityBarProvider>,
    ) {
        let mut inner = self.inner.lock().unwrap();
        inner
            .activity_bar_providers
            .insert(provider_id.into(), provider);
    }

    /// Gets all activity bar items from all providers.
    pub fn get_activity_bar_items(&self) -> Vec<ActivityBarItem> {
        let inner = self.inner.lock().unwrap();
        let mut items = Vec::new();
        for provider in inner.activity_bar_providers.values() {
            items.extend(provider.get_items());
        }
        items
    }

    /// Notifies an activity bar provider that an item was clicked.
    pub fn notify_activity_bar_clicked(&self, provider_id: &str, item_id: &str) {
        let inner = self.inner.lock().unwrap();
        if let Some(provider) = inner.activity_bar_providers.get(provider_id) {
            provider.on_click(item_id);
        }
    }

    /// Registers a context menu provider.
    pub fn register_context_menu_provider(
        &self,
        provider_id: impl Into<String>,
        provider: Arc<dyn ContextMenuProvider>,
    ) {
        let mut inner = self.inner.lock().unwrap();
        inner
            .context_menu_providers
            .insert(provider_id.into(), provider);
    }

    /// Gets context menu items for a given context.
    pub fn get_context_menu_items(&self, context: &str) -> Vec<ContextMenuItem> {
        let inner = self.inner.lock().unwrap();
        let mut items = Vec::new();
        for provider in inner.context_menu_providers.values() {
            items.extend(provider.get_items(context));
        }
        items
    }

    /// Notifies a context menu provider that an item was clicked.
    pub fn notify_context_menu_clicked(&self, provider_id: &str, item_id: &str) {
        let inner = self.inner.lock().unwrap();
        if let Some(provider) = inner.context_menu_providers.get(provider_id) {
            provider.on_click(item_id);
        }
    }

    /// Clears all registered providers.
    pub fn clear_all(&self) {
        let mut inner = self.inner.lock().unwrap();
        inner.status_bar_items.clear();
        inner.tree_view_providers.clear();
        inner.activity_bar_providers.clear();
        inner.context_menu_providers.clear();
    }
}
