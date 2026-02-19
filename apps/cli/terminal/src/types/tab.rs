use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq, Hash)]
pub struct TabId(pub String);

impl TabId {
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

impl Default for TabId {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub enum TabState {
    Active,
    Inactive,
    Loading,
    Error(String),
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct TabConfig {
    pub title: String,
    pub icon: Option<String>,
    pub pinned: bool,
    pub closable: bool,
}

impl Default for TabConfig {
    fn default() -> Self {
        Self {
            title: "New Tab".to_string(),
            icon: None,
            pinned: false,
            closable: true,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Tab {
    pub id: TabId,
    pub state: TabState,
    pub config: TabConfig,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub metadata: HashMap<String, String>,
}

impl Tab {
    pub fn new(config: TabConfig) -> Self {
        let now = chrono::Utc::now();
        Self {
            id: TabId::new(),
            state: TabState::Loading,
            config,
            created_at: now,
            updated_at: now,
            metadata: HashMap::new(),
        }
    }

    pub fn with_id(id: TabId, config: TabConfig) -> Self {
        let now = chrono::Utc::now();
        Self {
            id,
            state: TabState::Loading,
            config,
            created_at: now,
            updated_at: now,
            metadata: HashMap::new(),
        }
    }

    pub fn set_title(&mut self, title: String) {
        self.config.title = title;
        self.updated_at = chrono::Utc::now();
    }

    pub fn set_state(&mut self, state: TabState) {
        self.state = state;
        self.updated_at = chrono::Utc::now();
    }

    pub fn set_metadata(&mut self, key: String, value: String) {
        self.metadata.insert(key, value);
        self.updated_at = chrono::Utc::now();
    }

    pub fn get_metadata(&self, key: &str) -> Option<&String> {
        self.metadata.get(key)
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct TabLayout {
    pub tabs: Vec<Tab>,
    pub active_tab_id: Option<TabId>,
    pub tab_order: Vec<TabId>,
}

impl Default for TabLayout {
    fn default() -> Self {
        Self {
            tabs: Vec::new(),
            active_tab_id: None,
            tab_order: Vec::new(),
        }
    }
}

impl TabLayout {
    pub fn add_tab(&mut self, tab: Tab) {
        self.tab_order.push(tab.id.clone());
        self.tabs.push(tab);
    }

    pub fn remove_tab(&mut self, tab_id: &TabId) -> Option<Tab> {
        self.tab_order.retain(|id| id != tab_id);
        self.tabs
            .iter()
            .position(|t| &t.id == tab_id)
            .map(|i| self.tabs.remove(i))
    }

    pub fn get_tab(&self, tab_id: &TabId) -> Option<&Tab> {
        self.tabs.iter().find(|t| &t.id == tab_id)
    }

    pub fn get_tab_mut(&mut self, tab_id: &TabId) -> Option<&mut Tab> {
        self.tabs.iter_mut().find(|t| &t.id == tab_id)
    }

    pub fn set_active_tab(&mut self, tab_id: TabId) {
        self.active_tab_id = Some(tab_id);
    }

    pub fn get_active_tab(&self) -> Option<&Tab> {
        self.active_tab_id.as_ref().and_then(|id| self.get_tab(id))
    }

    pub fn reorder_tabs(&mut self, new_order: Vec<TabId>) {
        self.tab_order = new_order;
    }
}
