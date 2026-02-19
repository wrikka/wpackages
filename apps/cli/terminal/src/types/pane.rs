use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq, Hash)]
pub struct PaneId(pub String);

impl PaneId {
    pub fn new() -> Self {
        Self(uuid::Uuid::new_v4().to_string())
    }

    pub fn from_string(id: String) -> Self {
        Self(id)
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl Default for PaneId {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub enum SplitDirection {
    Horizontal,
    Vertical,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct PaneSplit {
    pub direction: SplitDirection,
    pub ratio: f32,
}

impl Default for PaneSplit {
    fn default() -> Self {
        Self {
            direction: SplitDirection::Horizontal,
            ratio: 0.5,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct PaneConfig {
    pub title: String,
    pub closable: bool,
    pub resizable: bool,
    pub min_size: Option<u32>,
    pub max_size: Option<u32>,
}

impl Default for PaneConfig {
    fn default() -> Self {
        Self {
            title: "Pane".to_string(),
            closable: true,
            resizable: true,
            min_size: None,
            max_size: None,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Pane {
    pub id: PaneId,
    pub config: PaneConfig,
    pub split: Option<PaneSplit>,
    pub children: Vec<PaneId>,
    pub parent_id: Option<PaneId>,
    pub tab_id: Option<super::tab::TabId>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

impl Pane {
    pub fn new(config: PaneConfig) -> Self {
        let now = chrono::Utc::now();
        Self {
            id: PaneId::new(),
            config,
            split: None,
            children: Vec::new(),
            parent_id: None,
            tab_id: None,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn with_id(id: PaneId, config: PaneConfig) -> Self {
        let now = chrono::Utc::now();
        Self {
            id,
            config,
            split: None,
            children: Vec::new(),
            parent_id: None,
            tab_id: None,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn split(&mut self, direction: SplitDirection, ratio: f32) {
        self.split = Some(PaneSplit { direction, ratio });
        self.updated_at = chrono::Utc::now();
    }

    pub fn add_child(&mut self, child_id: PaneId) {
        self.children.push(child_id);
        self.updated_at = chrono::Utc::now();
    }

    pub fn remove_child(&mut self, child_id: &PaneId) {
        self.children.retain(|id| id != child_id);
        self.updated_at = chrono::Utc::now();
    }

    pub fn set_parent(&mut self, parent_id: PaneId) {
        self.parent_id = Some(parent_id);
        self.updated_at = chrono::Utc::now();
    }

    pub fn set_tab(&mut self, tab_id: super::tab::TabId) {
        self.tab_id = Some(tab_id);
        self.updated_at = chrono::Utc::now();
    }

    pub fn is_leaf(&self) -> bool {
        self.children.is_empty()
    }

    pub fn is_root(&self) -> bool {
        self.parent_id.is_none()
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct PaneLayout {
    pub panes: HashMap<PaneId, Pane>,
    pub root_pane_id: Option<PaneId>,
    pub active_pane_id: Option<PaneId>,
}

impl Default for PaneLayout {
    fn default() -> Self {
        Self {
            panes: HashMap::new(),
            root_pane_id: None,
            active_pane_id: None,
        }
    }
}

impl PaneLayout {
    pub fn new(root_pane: Pane) -> Self {
        let root_id = root_pane.id.clone();
        let mut panes = HashMap::new();
        panes.insert(root_id.clone(), root_pane);
        Self {
            panes,
            root_pane_id: Some(root_id),
            active_pane_id: None,
        }
    }

    pub fn add_pane(&mut self, pane: Pane) {
        self.panes.insert(pane.id.clone(), pane);
    }

    pub fn remove_pane(&mut self, pane_id: &PaneId) -> Option<Pane> {
        self.panes.remove(pane_id)
    }

    pub fn get_pane(&self, pane_id: &PaneId) -> Option<&Pane> {
        self.panes.get(pane_id)
    }

    pub fn get_pane_mut(&mut self, pane_id: &PaneId) -> Option<&mut Pane> {
        self.panes.get_mut(pane_id)
    }

    pub fn set_active_pane(&mut self, pane_id: PaneId) {
        self.active_pane_id = Some(pane_id);
    }

    pub fn get_active_pane(&self) -> Option<&Pane> {
        self.active_pane_id
            .as_ref()
            .and_then(|id| self.get_pane(id))
    }

    pub fn split_pane(
        &mut self,
        pane_id: &PaneId,
        direction: SplitDirection,
        ratio: f32,
    ) -> Result<(), String> {
        let pane = self
            .get_pane(pane_id)
            .ok_or_else(|| "Pane not found".to_string())?;

        if !pane.is_leaf() {
            return Err("Cannot split non-leaf pane".to_string());
        }

        let mut new_pane = Pane::new(PaneConfig::default());
        new_pane.set_parent(pane_id.clone());
        new_pane.set_tab(
            pane.tab_id
                .clone()
                .ok_or_else(|| "Pane has no tab".to_string())?,
        );

        let new_pane_id = new_pane.id.clone();
        self.add_pane(new_pane);

        if let Some(pane) = self.get_pane_mut(pane_id) {
            pane.split(direction, ratio);
            pane.add_child(new_pane_id);
        }

        Ok(())
    }
}
