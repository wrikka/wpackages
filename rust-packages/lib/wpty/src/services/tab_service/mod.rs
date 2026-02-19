mod tree_utils;

use std::collections::HashMap;
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::error::{AppError, Result};
use crate::types::layout::{LeafNode, Node, SplitDirection};
use crate::types::{TabInfo, TabLayout};

#[derive(Clone)]
pub struct TabService {
    tabs: Arc<Mutex<HashMap<u32, TabLayout>>>,
    active_tab_id: Arc<Mutex<u32>>,
    next_tab_id: Arc<AtomicU32>,
    next_pane_id: Arc<AtomicU32>,
}

impl TabService {
    pub fn new() -> Self {
        Self {
            tabs: Arc::new(Mutex::new(HashMap::new())),
            active_tab_id: Arc::new(Mutex::new(0)),
            next_tab_id: Arc::new(AtomicU32::new(1)),
            next_pane_id: Arc::new(AtomicU32::new(1)),
        }
    }

    pub async fn create_tab(&self, session_id: u32) -> TabLayout {
        let tab_id = self.next_tab_id.fetch_add(1, Ordering::SeqCst);
        let pane_id = self.next_pane_id.fetch_add(1, Ordering::SeqCst);

        let root = Node::Leaf(LeafNode { id: pane_id, session_id });

        let layout = TabLayout {
            tab_id,
            root,
            active_pane_id: pane_id,
        };

        self.tabs.lock().await.insert(tab_id, layout.clone());
        layout
    }

    pub async fn split_pane(
        &self,
        tab_id: u32,
        pane_id_to_split: u32,
        direction: SplitDirection,
        new_session_id: u32,
    ) -> Result<(TabLayout, u32)> {
        let mut tabs = self.tabs.lock().await;
        let layout = tabs.get_mut(&tab_id).ok_or_else(|| {
            AppError::session_not_found(tab_id)
        })?;

        let new_pane_id = self.next_pane_id.fetch_add(1, Ordering::SeqCst);
        let new_split_id = self.next_pane_id.fetch_add(1, Ordering::SeqCst);

        let new_leaf = LeafNode {
            id: new_pane_id,
            session_id: new_session_id,
        };

        let (new_root, split_occurred) = tree_utils::recursive_split(
            layout.root.clone(),
            pane_id_to_split,
            &new_leaf,
            direction,
            new_split_id,
        );

        if split_occurred {
            layout.root = new_root;
            layout.active_pane_id = new_pane_id;
            Ok((layout.clone(), new_pane_id))
        } else {
            Err(AppError::internal(format!(
                "Pane with id {} not found in tab {}",
                pane_id_to_split,
                tab_id
            )))
        }
    }


    pub async fn close_pane(
        &self,
        tab_id: u32,
        pane_id_to_close: u32,
    ) -> Result<(Option<TabLayout>, Option<u32>)> {
        let mut tabs = self.tabs.lock().await;
        let layout = tabs.get_mut(&tab_id).ok_or_else(|| {
            AppError::session_not_found(tab_id)
        })?;

        let (new_root, session_id_to_kill) = tree_utils::recursive_close(layout.root.clone(), pane_id_to_close);

        if session_id_to_kill.is_some() {
            if let Some(new_root_node) = new_root {
                layout.root = new_root_node;
                layout.active_pane_id = tree_utils::find_first_leaf_id(&layout.root).unwrap_or(0);
                Ok((Some(layout.clone()), session_id_to_kill))
            } else {
                tabs.remove(&tab_id);
                Ok((None, session_id_to_kill))
            }
        } else {
            Err(AppError::internal(format!(
                "Pane with id {} not found in tab {}",
                pane_id_to_close,
                tab_id
            )))
        }
    }



    pub async fn focus_pane(&self, tab_id: u32, pane_id: u32) -> Result<TabLayout> {
        let mut tabs = self.tabs.lock().await;
        let layout = tabs.get_mut(&tab_id).ok_or_else(|| {
            AppError::session_not_found(tab_id)
        })?;

        if tree_utils::pane_exists(&layout.root, pane_id) {
            layout.active_pane_id = pane_id;
            Ok(layout.clone())
        } else {
            Err(AppError::internal(format!(
                "Pane with id {} not found in tab {}",
                pane_id,
                tab_id
            )))
        }
    }


    pub async fn list_tabs(&self) -> Vec<TabInfo> {
        let tabs = self.tabs.lock().await;
        let active_tab_id = *self.active_tab_id.lock().await;
        let mut tab_infos = Vec::new();

        for (id, _layout) in tabs.iter() {
            tab_infos.push(TabInfo {
                id: *id,
                title: format!("Tab {}", id),
                is_active: *id == active_tab_id,
            });
        }
        tab_infos.sort_by_key(|t| t.id);
        tab_infos
    }

    pub async fn set_active_tab(&self, tab_id: u32) -> Result<()> {
        let tabs = self.tabs.lock().await;
        if tabs.contains_key(&tab_id) {
            let mut active_tab = self.active_tab_id.lock().await;
            *active_tab = tab_id;
            Ok(())
        } else {
            Err(AppError::session_not_found(tab_id))
        }
    }

    pub async fn close_tab(&self, tab_id: u32) -> Result<Vec<u32>> {
        let mut tabs = self.tabs.lock().await;
        if let Some(layout) = tabs.remove(&tab_id) {
            let mut sessions_to_kill = Vec::new();
            tree_utils::collect_session_ids(&layout.root, &mut sessions_to_kill);

            let mut active_tab_id = self.active_tab_id.lock().await;
            if *active_tab_id == tab_id {
                *active_tab_id = tabs.keys().next().cloned().unwrap_or(0);
            }
            Ok(sessions_to_kill)
        } else {
            Err(AppError::session_not_found(tab_id))
        }
    }


    // Methods for session state management
    pub async fn get_tabs_for_saving(&self) -> HashMap<u32, TabLayout> {
        self.tabs.lock().await.clone()
    }

    pub async fn get_active_tab_id_for_saving(&self) -> u32 {
        *self.active_tab_id.lock().await
    }

        pub async fn restore_session_state(&self, tabs: HashMap<u32, TabLayout>, active_tab_id: u32, _max_session_id: u32) {
        *self.tabs.lock().await = tabs;
        *self.active_tab_id.lock().await = active_tab_id;

        let max_tab_id = self.tabs.lock().await.keys().max().cloned().unwrap_or(0);
        let mut max_pane_id = 0;
        for tab in self.tabs.lock().await.values() {
            tree_utils::find_max_pane_id(&tab.root, &mut max_pane_id);
        }

        self.next_tab_id.store(max_tab_id + 1, Ordering::SeqCst);
        self.next_pane_id.store(max_pane_id + 1, Ordering::SeqCst);
    }

}

impl Default for TabService {
    fn default() -> Self {
        Self::new()
    }
}
