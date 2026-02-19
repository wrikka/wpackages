use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnapshotNode {
    pub ref_id: String,
    pub role: String,
    pub name: Option<String>,
    pub value: Option<String>,
    pub description: Option<String>,
    pub level: Option<u32>,
    pub children: Vec<SnapshotNode>,
}

impl SnapshotNode {
    pub fn new(ref_id: impl Into<String>, role: impl Into<String>) -> Self {
        Self {
            ref_id: ref_id.into(),
            role: role.into(),
            name: None,
            value: None,
            description: None,
            level: None,
            children: Vec::new(),
        }
    }

    pub fn with_name(mut self, name: impl Into<String>) -> Self {
        self.name = Some(name.into());
        self
    }

    pub fn with_value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    pub fn with_level(mut self, level: u32) -> Self {
        self.level = Some(level);
        self
    }

    pub fn add_child(&mut self, child: SnapshotNode) {
        self.children.push(child);
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Snapshot {
    pub url: String,
    pub title: Option<String>,
    pub nodes: Vec<SnapshotNode>,
}

impl Snapshot {
    pub fn new(url: impl Into<String>) -> Self {
        Self {
            url: url.into(),
            title: None,
            nodes: Vec::new(),
        }
    }

    pub fn with_title(mut self, title: impl Into<String>) -> Self {
        self.title = Some(title.into());
        self
    }

    pub fn add_node(&mut self, node: SnapshotNode) {
        self.nodes.push(node);
    }
}
