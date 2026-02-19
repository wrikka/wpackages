//! Layout components - Pure functions for tab/pane layout calculations
//!
//! All functions are pure - no side effects, deterministic output

use crate::types::layout::{LeafNode, Node, SplitDirection};

/// Find the first leaf node ID in a tree
pub fn find_first_leaf_id(node: &Node) -> Option<u32> {
    match node {
        Node::Leaf(leaf) => Some(leaf.id),
        Node::Split(split) => find_first_leaf_id(&split.children.first()?.clone()),
    }
}

/// Check if a pane exists in the layout
pub fn pane_exists(node: &Node, pane_id: u32) -> bool {
    match node {
        Node::Leaf(leaf) => leaf.id == pane_id,
        Node::Split(split) => split.children.iter().any(|child| pane_exists(child, pane_id)),
    }
}

/// Find the maximum pane ID in the layout
pub fn find_max_pane_id(node: &Node, max_id: &mut u32) {
    match node {
        Node::Leaf(leaf) => {
            if leaf.id > *max_id {
                *max_id = leaf.id;
            }
        }
        Node::Split(split) => {
            for child in &split.children {
                find_max_pane_id(child, max_id);
            }
        }
    }
}

/// Collect all session IDs from the layout
pub fn collect_session_ids(node: &Node, sessions: &mut Vec<u32>) {
    match node {
        Node::Leaf(leaf) => sessions.push(leaf.session_id),
        Node::Split(split) => {
            for child in &split.children {
                collect_session_ids(child, sessions);
            }
        }
    }
}
