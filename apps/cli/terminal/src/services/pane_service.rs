use crate::error::{AppError, AppResult};
use crate::types::{Pane, PaneConfig, PaneId, PaneLayout, PaneSplit, SplitDirection};
use dashmap::DashMap;
use serde::Serialize;
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Runtime};
use tokio::sync::RwLock;

#[derive(Clone, Serialize)]
pub struct PaneEvent {
    pub event_type: PaneEventType,
    pub pane_id: PaneId,
    pub pane: Option<Pane>,
}

#[derive(Clone, Serialize)]
pub enum PaneEventType {
    Created,
    Closed,
    Split,
    Resized,
    Focused,
}

#[derive(Clone)]
pub struct PaneService {
    panes: Arc<DashMap<PaneId, Pane>>,
    layout: Arc<RwLock<PaneLayout>>,
}

impl Default for PaneService {
    fn default() -> Self {
        Self::new()
    }
}

impl PaneService {
    pub fn new() -> Self {
        Self {
            panes: Arc::new(DashMap::new()),
            layout: Arc::new(RwLock::new(PaneLayout::default())),
        }
    }

    pub async fn create_pane<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        config: PaneConfig,
        tab_id: Option<crate::types::TabId>,
    ) -> AppResult<PaneId> {
        let pane = Pane::new(config);
        let pane_id = pane.id.clone();

        if let Some(tab_id) = tab_id {
            let mut pane_mut = pane;
            pane_mut.set_tab(tab_id);
            self.panes.insert(pane_id.clone(), pane_mut.clone());
        } else {
            self.panes.insert(pane_id.clone(), pane.clone());
        }

        // If this is the first pane, make it the root
        let mut layout = self.layout.write().await;
        if layout.root_pane_id.is_none() {
            layout.root_pane_id = Some(pane_id.clone());
            layout.add_pane(pane.clone());
        } else {
            layout.add_pane(pane.clone());
        }

        self.emit_event(
            &app_handle,
            PaneEvent {
                event_type: PaneEventType::Created,
                pane_id: pane_id.clone(),
                pane: Some(pane),
            },
        )?;

        Ok(pane_id)
    }

    pub async fn close_pane<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        pane_id: PaneId,
    ) -> AppResult<()> {
        let pane = self.panes.remove(&pane_id);

        if let Some((_, pane)) = pane {
            let mut layout = self.layout.write().await;
            layout.remove_pane(&pane_id);

            // Update parent's children
            if let Some(parent_id) = &pane.parent_id {
                if let Some(parent) = layout.get_pane_mut(parent_id) {
                    parent.remove_child(&pane_id);
                }
            }

            // Move children to parent or close them
            for child_id in &pane.children {
                if let Some(child) = layout.get_pane(child_id) {
                    if child.is_leaf() {
                        // Close leaf panes
                        self.close_pane(app_handle.clone(), child_id.clone())
                            .await?;
                    }
                }
            }

            drop(layout);

            self.emit_event(
                &app_handle,
                PaneEvent {
                    event_type: PaneEventType::Closed,
                    pane_id,
                    pane: Some(pane),
                },
            )?;
        }

        Ok(())
    }

    pub async fn split_pane<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        pane_id: PaneId,
        direction: SplitDirection,
        ratio: f32,
    ) -> AppResult<PaneId> {
        let mut layout = self.layout.write().await;

        layout.split_pane(&pane_id, direction, ratio)?;

        let new_pane_id = if let Some(pane) = layout.get_pane(&pane_id) {
            pane.children.last().cloned()
        } else {
            None
        };

        drop(layout);

        if let Some(new_pane_id) = new_pane_id {
            self.emit_event(
                &app_handle,
                PaneEvent {
                    event_type: PaneEventType::Split,
                    pane_id: new_pane_id.clone(),
                    pane: self.panes.get(&new_pane_id).map(|p| p.clone()),
                },
            )?;
            Ok(new_pane_id)
        } else {
            Err(AppError::Other("Failed to split pane".to_string()))
        }
    }

    pub async fn resize_pane<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        pane_id: PaneId,
        ratio: f32,
    ) -> AppResult<()> {
        let mut layout = self.layout.write().await;

        if let Some(pane) = layout.get_pane_mut(&pane_id) {
            if let Some(ref mut split) = pane.split {
                split.ratio = ratio.clamp(0.1, 0.9);
            }
        }

        drop(layout);

        self.emit_event(
            &app_handle,
            PaneEvent {
                event_type: PaneEventType::Resized,
                pane_id,
                pane: self.panes.get(&pane_id).map(|p| p.clone()),
            },
        )?;

        Ok(())
    }

    pub async fn focus_pane<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        pane_id: PaneId,
    ) -> AppResult<()> {
        let mut layout = self.layout.write().await;
        layout.set_active_pane(pane_id.clone());
        drop(layout);

        self.emit_event(
            &app_handle,
            PaneEvent {
                event_type: PaneEventType::Focused,
                pane_id: pane_id.clone(),
                pane: self.panes.get(&pane_id).map(|p| p.clone()),
            },
        )?;

        Ok(())
    }

    pub async fn get_pane(&self, pane_id: &PaneId) -> Option<Pane> {
        self.panes.get(pane_id).map(|p| p.clone())
    }

    pub async fn get_all_panes(&self) -> Vec<Pane> {
        self.panes.iter().map(|p| p.clone()).collect()
    }

    pub async fn get_layout(&self) -> PaneLayout {
        self.layout.read().await.clone()
    }

    pub async fn get_active_pane(&self) -> Option<Pane> {
        let layout = self.layout.read().await;
        layout
            .active_pane_id
            .as_ref()
            .and_then(|id| self.panes.get(id).map(|p| p.clone()))
    }

    pub async fn get_root_pane(&self) -> Option<Pane> {
        let layout = self.layout.read().await;
        layout
            .root_pane_id
            .as_ref()
            .and_then(|id| self.panes.get(id).map(|p| p.clone()))
    }

    pub async fn get_pane_children(&self, pane_id: &PaneId) -> Vec<Pane> {
        if let Some(pane) = self.panes.get(pane_id) {
            pane.children
                .iter()
                .filter_map(|id| self.panes.get(id).map(|p| p.clone()))
                .collect()
        } else {
            vec![]
        }
    }

    pub async fn is_leaf_pane(&self, pane_id: &PaneId) -> bool {
        self.panes
            .get(pane_id)
            .map(|p| p.is_leaf())
            .unwrap_or(false)
    }

    pub async fn is_root_pane(&self, pane_id: &PaneId) -> bool {
        self.panes
            .get(pane_id)
            .map(|p| p.is_root())
            .unwrap_or(false)
    }

    fn emit_event<R: Runtime>(&self, app_handle: &AppHandle<R>, event: PaneEvent) -> AppResult<()> {
        app_handle
            .emit("pane-event", event)
            .map_err(|e| AppError::Other(format!("Failed to emit pane event: {}", e)))?;
        Ok(())
    }

    pub async fn get_pane_count(&self) -> usize {
        self.panes.len()
    }
}
