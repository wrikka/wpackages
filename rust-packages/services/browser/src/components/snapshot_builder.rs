use crate::types::{Snapshot, SnapshotNode};

#[derive(Debug, Clone, Default)]
pub struct SnapshotBuilder {
    elements: Vec<SnapshotNode>,
}

impl SnapshotBuilder {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn add_element(&mut self, element: SnapshotNode) {
        self.elements.push(element);
    }

    pub fn build(self, url: impl Into<String>, title: Option<String>) -> Snapshot {
        Snapshot {
            url: url.into(),
            title,
            nodes: self.elements,
        }
    }

    pub fn clear(&mut self) {
        self.elements.clear();
    }

    pub fn len(&self) -> usize {
        self.elements.len()
    }

    pub fn is_empty(&self) -> bool {
        self.elements.is_empty()
    }
}
