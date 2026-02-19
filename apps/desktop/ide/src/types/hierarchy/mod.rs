//! # Hierarchy Types
//!
//! Types for code hierarchy representation.

mod item;
mod kind;
mod direction;
mod tree;

pub use item::HierarchyItem;
pub use kind::HierarchyKind;
pub use direction::HierarchyDirection;
pub use tree::HierarchyTree;

use lsp_types::{Position, Url};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Hierarchy
#[derive(Debug, Clone)]
pub struct Hierarchy {
    pub trees: HashMap<Url, HierarchyTree>,
}

impl Hierarchy {
    pub fn new() -> Self {
        Self {
            trees: HashMap::new(),
        }
    }

    pub fn add_tree(&mut self, uri: Url, tree: HierarchyTree) {
        self.trees.insert(uri, tree);
    }

    pub fn get_tree(&self, uri: &Url) -> Option<&HierarchyTree> {
        self.trees.get(uri)
    }

    pub fn get_tree_mut(&mut self, uri: &Url) -> Option<&mut HierarchyTree> {
        self.trees.get_mut(uri)
    }

    pub fn remove_tree(&mut self, uri: &Url) -> Option<HierarchyTree> {
        self.trees.remove(uri)
    }

    pub fn clear(&mut self) {
        self.trees.clear();
    }

    pub fn count(&self) -> usize {
        self.trees.len()
    }

    pub fn is_empty(&self) -> bool {
        self.trees.is_empty()
    }
}

impl Default for Hierarchy {
    fn default() -> Self {
        Self::new()
    }
}
