use crate::types::layout::{LeafNode, Node, SplitDirection, SplitNode};

pub fn recursive_split(
    node: Node,
    pane_id_to_split: u32,
    new_leaf: &LeafNode,
    direction: SplitDirection,
    new_split_id: u32,
) -> (Node, bool) {
    match node {
        Node::Leaf(leaf) => {
            if leaf.id == pane_id_to_split {
                let new_split = SplitNode {
                    id: new_split_id,
                    direction,
                    children: vec![Node::Leaf(leaf), Node::Leaf(new_leaf.clone())],
                    sizes: vec![0.5, 0.5],
                };
                (Node::Split(new_split), true)
            } else {
                (Node::Leaf(leaf), false)
            }
        }
        Node::Split(mut split) => {
            let mut new_children = Vec::new();
            let mut split_occurred = false;
            for child in split.children {
                if split_occurred {
                    new_children.push(child);
                    continue;
                }
                let (new_child, occurred) = recursive_split(
                    child,
                    pane_id_to_split,
                    new_leaf,
                    direction,
                    new_split_id,
                );
                new_children.push(new_child);
                if occurred {
                    split_occurred = true;
                }
            }
            split.children = new_children;
            (Node::Split(split), split_occurred)
        }
    }
}

pub fn recursive_close(node: Node, pane_id_to_close: u32) -> (Option<Node>, Option<u32>) {
    match node {
        Node::Leaf(leaf) => {
            if leaf.id == pane_id_to_close {
                (None, Some(leaf.session_id))
            } else {
                (Some(Node::Leaf(leaf)), None)
            }
        }
        Node::Split(mut split) => {
            let mut session_id_to_kill = None;
            let mut children_after_close = Vec::new();

            for child in split.children {
                let (new_child, killed_id) = recursive_close(child, pane_id_to_close);
                if let Some(id) = killed_id {
                    session_id_to_kill = Some(id);
                }
                if let Some(node) = new_child {
                    children_after_close.push(node);
                }
            }

            if session_id_to_kill.is_some() {
                if children_after_close.len() == 1 {
                    (children_after_close.pop(), session_id_to_kill)
                } else if children_after_close.is_empty() {
                    (None, session_id_to_kill)
                } else {
                    split.children = children_after_close;
                    (Some(Node::Split(split)), session_id_to_kill)
                }
            } else {
                split.children = children_after_close;
                (Some(Node::Split(split)), None)
            }
        }
    }
}

pub fn find_first_leaf_id(node: &Node) -> Option<u32> {
    match node {
        Node::Leaf(leaf) => Some(leaf.id),
        Node::Split(split) => {
            for child in &split.children {
                if let Some(id) = find_first_leaf_id(child) {
                    return Some(id);
                }
            }
            None
        }
    }
}

pub fn pane_exists(node: &Node, pane_id: u32) -> bool {
    match node {
        Node::Leaf(leaf) => leaf.id == pane_id,
        Node::Split(split) => split.children.iter().any(|child| pane_exists(child, pane_id)),
    }
}

pub fn collect_session_ids(node: &Node, session_ids: &mut Vec<u32>) {
    match node {
        Node::Leaf(leaf) => session_ids.push(leaf.session_id),
        Node::Split(split) => {
            for child in &split.children {
                collect_session_ids(child, session_ids);
            }
        }
    }
}

pub fn find_max_pane_id(node: &Node, max_id: &mut u32) {
    match node {
        Node::Leaf(leaf) => {
            if leaf.id > *max_id {
                *max_id = leaf.id;
            }
        }
        Node::Split(split) => {
            if split.id > *max_id {
                *max_id = split.id;
            }
            for child in &split.children {
                find_max_pane_id(child, max_id);
            }
        }
    }
}
