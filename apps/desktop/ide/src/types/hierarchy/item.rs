//! # Hierarchy Item
//!
//! Hierarchy item type and its methods.

use lsp_types::{Position, Range, Url};
use serde::{Deserialize, Serialize};

/// Hierarchy item
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HierarchyItem {
    pub name: String,
    pub kind: super::HierarchyKind,
    pub uri: Url,
    pub range: Range,
    pub detail: Option<String>,
    pub children: Vec<HierarchyItem>,
}

impl HierarchyItem {
    pub fn new(name: impl Into<String>, kind: super::HierarchyKind, uri: Url, range: Range) -> Self {
        Self {
            name: name.into(),
            kind,
            uri,
            range,
            detail: None,
            children: Vec::new(),
        }
    }

    pub fn with_detail(mut self, detail: impl Into<String>) -> Self {
        self.detail = Some(detail.into());
        self
    }

    pub fn with_children(mut self, children: Vec<HierarchyItem>) -> Self {
        self.children = children;
        self
    }

    pub fn position(&self) -> Position {
        self.range.start
    }

    pub fn end_position(&self) -> Position {
        self.range.end
    }

    pub fn has_children(&self) -> bool {
        !self.children.is_empty()
    }

    pub fn add_child(&mut self, child: HierarchyItem) {
        self.children.push(child);
    }

    pub fn find_by_name(&self, name: &str) -> Option<&HierarchyItem> {
        if self.name == name {
            return Some(self);
        }

        for child in &self.children {
            if let Some(found) = child.find_by_name(name) {
                return Some(found);
            }
        }

        None
    }

    pub fn find_by_name_mut(&mut self, name: &str) -> Option<&mut HierarchyItem> {
        if self.name == name {
            return Some(self);
        }

        for child in &mut self.children {
            if let Some(found) = child.find_by_name_mut(name) {
                return Some(found);
            }
        }

        None
    }

    pub fn count_items(&self) -> usize {
        let mut count = 1;
        for child in &self.children {
            count += child.count_items();
        }
        count
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hierarchy_item() {
        let item = HierarchyItem::new(
            "MyClass",
            super::HierarchyKind::Class,
            Url::parse("file:///test.rs").expect("Failed to parse test URL"),
            Range::new(Position::new(0, 0), Position::new(20, 0)),
        )
        .with_detail("class MyClass");

        assert_eq!(item.name, "MyClass");
        assert_eq!(item.kind, super::HierarchyKind::Class);
        assert_eq!(item.detail, Some("class MyClass".to_string()));
    }

    #[test]
    fn test_hierarchy_item_with_children() {
        let mut parent = HierarchyItem::new(
            "Parent",
            super::HierarchyKind::Class,
            Url::parse("file:///test.rs").expect("Failed to parse test URL"),
            Range::new(Position::new(0, 0), Position::new(20, 0)),
        );

        let child = HierarchyItem::new(
            "Child",
            super::HierarchyKind::Method,
            Url::parse("file:///test.rs").expect("Failed to parse test URL"),
            Range::new(Position::new(5, 0), Position::new(10, 0)),
        );

        parent.add_child(child);

        assert_eq!(parent.count_items(), 2);
        assert!(parent.has_children());
    }
}
