use crate::error::{AppError, AppResult};
use crate::types::{Tab, TabConfig, TabId, TabLayout, TabState};
use dashmap::DashMap;
use serde::Serialize;
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Runtime};
use tokio::sync::RwLock;

#[derive(Clone, Serialize)]
pub struct TabEvent {
    pub event_type: TabEventType,
    pub tab_id: TabId,
    pub tab: Option<Tab>,
}

#[derive(Clone, Serialize)]
pub enum TabEventType {
    Created,
    Closed,
    Updated,
    Activated,
    Deactivated,
    Moved,
}

#[derive(Clone)]
pub struct TabService {
    tabs: Arc<DashMap<TabId, Tab>>,
    layout: Arc<RwLock<TabLayout>>,
}

impl Default for TabService {
    fn default() -> Self {
        Self::new()
    }
}

impl TabService {
    pub fn new() -> Self {
        Self {
            tabs: Arc::new(DashMap::new()),
            layout: Arc::new(RwLock::new(TabLayout::default())),
        }
    }

    pub async fn create_tab<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        config: TabConfig,
    ) -> AppResult<TabId> {
        let tab = Tab::new(config);
        let tab_id = tab.id.clone();

        self.tabs.insert(tab_id.clone(), tab.clone());

        let mut layout = self.layout.write().await;
        layout.add_tab(tab.clone());
        layout.set_active_tab(tab_id.clone());

        self.emit_event(
            &app_handle,
            TabEvent {
                event_type: TabEventType::Created,
                tab_id: tab_id.clone(),
                tab: Some(tab),
            },
        )?;

        Ok(tab_id)
    }

    pub async fn close_tab<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        tab_id: TabId,
    ) -> AppResult<()> {
        let tab = self.tabs.remove(&tab_id);

        if let Some((_, tab)) = tab {
            let mut layout = self.layout.write().await;
            layout.remove_tab(&tab_id);

            // Activate another tab if this was the active one
            if layout.active_tab_id.as_ref() == Some(&tab_id) {
                if let Some(new_active) = layout.tab_order.last() {
                    layout.set_active_tab(new_active.clone());
                } else {
                    layout.active_tab_id = None;
                }
            }

            self.emit_event(
                &app_handle,
                TabEvent {
                    event_type: TabEventType::Closed,
                    tab_id,
                    tab: Some(tab),
                },
            )?;
        }

        Ok(())
    }

    pub async fn switch_tab<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        tab_id: TabId,
    ) -> AppResult<()> {
        let mut layout = self.layout.write().await;

        if layout.get_tab(&tab_id).is_some() {
            let old_active = layout.active_tab_id.clone();
            layout.set_active_tab(tab_id.clone());

            drop(layout);

            // Emit deactivated event for old tab
            if let Some(old_id) = old_active {
                if old_id != tab_id {
                    self.emit_event(
                        &app_handle,
                        TabEvent {
                            event_type: TabEventType::Deactivated,
                            tab_id: old_id,
                            tab: self.tabs.get(&old_id).map(|t| t.clone()),
                        },
                    )?;
                }
            }

            // Emit activated event for new tab
            self.emit_event(
                &app_handle,
                TabEvent {
                    event_type: TabEventType::Activated,
                    tab_id: tab_id.clone(),
                    tab: self.tabs.get(&tab_id).map(|t| t.clone()),
                },
            )?;
        }

        Ok(())
    }

    pub async fn rename_tab<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        tab_id: TabId,
        title: String,
    ) -> AppResult<()> {
        if let Some(mut tab) = self.tabs.get_mut(&tab_id) {
            tab.set_title(title.clone());
            let tab = tab.clone();

            self.emit_event(
                &app_handle,
                TabEvent {
                    event_type: TabEventType::Updated,
                    tab_id: tab_id.clone(),
                    tab: Some(tab),
                },
            )?;
        }

        Ok(())
    }

    pub async fn move_tab<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        tab_id: TabId,
        new_index: usize,
    ) -> AppResult<()> {
        let mut layout = self.layout.write().await;

        if let Some(pos) = layout.tab_order.iter().position(|id| id == &tab_id) {
            let tab_id = layout.tab_order.remove(pos);
            let index = new_index.min(layout.tab_order.len());
            layout.tab_order.insert(index, tab_id.clone());

            drop(layout);

            self.emit_event(
                &app_handle,
                TabEvent {
                    event_type: TabEventType::Moved,
                    tab_id,
                    tab: self.tabs.get(&tab_id).map(|t| t.clone()),
                },
            )?;
        }

        Ok(())
    }

    pub async fn get_tab(&self, tab_id: &TabId) -> Option<Tab> {
        self.tabs.get(tab_id).map(|t| t.clone())
    }

    pub async fn get_all_tabs(&self) -> Vec<Tab> {
        self.tabs.iter().map(|t| t.clone()).collect()
    }

    pub async fn get_layout(&self) -> TabLayout {
        self.layout.read().await.clone()
    }

    pub async fn get_active_tab(&self) -> Option<Tab> {
        let layout = self.layout.read().await;
        layout
            .active_tab_id
            .as_ref()
            .and_then(|id| self.tabs.get(id).map(|t| t.clone()))
    }

    pub async fn set_tab_state(&self, tab_id: &TabId, state: TabState) {
        if let Some(mut tab) = self.tabs.get_mut(tab_id) {
            tab.set_state(state);
        }
    }

    pub async fn set_tab_metadata(&self, tab_id: &TabId, key: String, value: String) {
        if let Some(mut tab) = self.tabs.get_mut(tab_id) {
            tab.set_metadata(key, value);
        }
    }

    pub async fn get_tab_metadata(&self, tab_id: &TabId, key: &str) -> Option<String> {
        self.tabs
            .get(tab_id)
            .and_then(|t| t.get_metadata(key).cloned())
    }

    fn emit_event<R: Runtime>(&self, app_handle: &AppHandle<R>, event: TabEvent) -> AppResult<()> {
        app_handle
            .emit("tab-event", event)
            .map_err(|e| AppError::Other(format!("Failed to emit tab event: {}", e)))?;
        Ok(())
    }

    pub async fn get_tab_count(&self) -> usize {
        self.tabs.len()
    }

    pub async fn has_tabs(&self) -> bool {
        !self.tabs.is_empty()
    }
}
