//! # File List Rendering
//!
//! Rendering methods for file list.

use crate::app::state::IdeState;

use super::node::render_node;

pub(crate) fn render_file_list(ui: &mut egui::Ui, state: &mut IdeState) {
    egui::ScrollArea::vertical()
        .id_salt("file_tree")
        .max_height(560.0)
        .show(ui, |ui| {
            let q = state.fs.file_search.trim().to_lowercase();
            let file_tree = &state.fs.file_tree;
            for n in file_tree {
                if q.is_empty() || node_matches_query(n, &q) {
                    render_node(ui, state, n, &q, 0);
                }
            }
        });
}

use crate::types::fs::FileNode;

fn node_matches_query(node: &FileNode, q: &str) -> bool {
    let name_hit = node.name.to_lowercase().contains(q);
    let path_hit = node.path.to_string().to_lowercase().contains(q);
    if name_hit || path_hit {
        return true;
    }

    if let Some(children) = &node.children {
        return children.iter().any(|c: &FileNode| node_matches_query(c, q));
    }

    false
}
