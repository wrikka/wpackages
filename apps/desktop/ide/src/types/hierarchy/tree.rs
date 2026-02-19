//! # Hierarchy Tree
//!
//! Hierarchy tree type and its methods.

use lsp_types::{Position, Url};
use serde::{Deserialize, Serialize};

use super::HierarchyItem;

/// Hierarchy tree
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HierarchyTree {
    pub root: HierarchyItem,
    pub uri: Url,
    pub position: Position,
}

impl HierarchyTree {
    pub fn new(root: HierarchyItem, uri: Url, position: Position) -> Self {
        Self {
            root,
            uri,
            position,
        }
    }

    pub fn find_parent(&self, position: Position) -> Option<&HierarchyItem> {
        self.find_parent_recursive(&self.root, position)
    }

    fn find_parent_recursive(&self, item: &HierarchyItem, position: Position) -> Option<&HierarchyItem> {
        for child in &item.children {
            if child.range.start.line <= position.line && child.range.end.line >= position.line {
                if child.range.start.line < position.line || child.range.start.character < position.character {
                    return Some(item);
                }
                if let Some(found) = self.find_parent_recursive(child, position) {
                    return Some(found);
                }
            }
        }

        None
    }

    pub fn find_item_at_position(&self, position: Position) -> Option<&HierarchyItem> {
        self.find_item_at_position_recursive(&self.root, position)
    }

    fn find_item_at_position_recursive(&self, item: &HierarchyItem, position: Position) -> Option<&HierarchyItem> {
        if item.range.start.line <= position.line && item.range.end.line >= position.line {
            for child in &item.children {
                if let Some(found) = self.find_item_at_position_recursive(child, position) {
                    return Some(found);
                }
            }
            return Some(item);
        }

        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hierarchy_tree() {
        let root = HierarchyItem::new(
            "Root",
            super::HierarchyKind::Class,
            Url::parse("file:///test.rs").expect("Failed to parse test URL"),
            Range::new(Position::new(0, 0), Position::new(100, 0)),
        );

        let uri = Url::parse("file:///test.rs").expect("Failed to parse test URL");
        let position = Position::new(10, 5);

        let tree = HierarchyTree::new(root, uri, position);

        let item = tree.find_item_at_position(position);
        assert!(item.is_some());
    }
}
