//! # Node Rendering
//!
//! Rendering methods for file tree nodes.

use crate::app::{actions, state::IdeState};
use crate::components::icons::{paint_file_icon, paint_folder_icon};
use crate::types::fs::{FileKind, FileNode};

use super::file_list::node_matches_query;

pub(crate) fn render_node(ui: &mut egui::Ui, state: &mut IdeState, node: &FileNode, q: &str, depth: usize) {
    match node.kind {
        FileKind::File => render_file_node(ui, state, node, q, depth),
        FileKind::Dir => render_dir_node(ui, state, node, q, depth),
    }
}

fn render_file_node(ui: &mut egui::Ui, state: &mut IdeState, node: &FileNode, q: &str, depth: usize) {
    if !q.is_empty() && !node_matches_query(node, q) {
        return;
    }

    let selected = state.fs.selected_file.as_ref() == Some(&node.path);
    let mut label = node.name.clone();

    if let Some(s) = state.git.git_status_abs.get(&node.path.to_string()) {
        if !s.is_empty() {
            label = format!("[{s}] {label}");
        }
    }

    if state.fs.show_file_size {
        if let Some(sz) = node.size_bytes {
            label.push_str(&format!("  ({} B)", sz));
        }
    }

    if state.fs.show_file_lines {
        if let Some(lines) = node.line_count {
            label.push_str(&format!("  ({} lines)", lines));
        }
    }

    let row = ui.horizontal(|ui| {
        ui.add_space((depth as f32) * 12.0);
        let icon_resp = paint_file_icon(ui, &node.name);
        let label_resp = ui.selectable_label(selected, label);
        (icon_resp, label_resp)
    });

    let (icon_resp, label_resp) = row.inner;
    if icon_resp.clicked() || label_resp.clicked() || row.response.clicked() {
        actions::open_file(state, &node.path.to_string());
    }
    if label_resp.double_clicked() {
        actions::begin_rename(state, &node.path.to_string());
    }

    if label_resp.secondary_clicked() || row.response.secondary_clicked() {
        actions::open_context_menu_at(
            state,
            &node.path.to_string(),
            false,
            ui.ctx().pointer_latest_pos(),
        );
    }
}

fn render_dir_node(ui: &mut egui::Ui, state: &mut IdeState, node: &FileNode, q: &str, depth: usize) {
    let expanded = state.fs.expanded_dirs.contains(&node.path);

    let row = ui.horizontal(|ui| {
        ui.add_space((depth as f32) * 12.0);
        let arrow = if expanded { "▾" } else { "▸" };
        let arrow_resp = ui.selectable_label(false, arrow);
        paint_folder_icon(ui);
        let label_resp = ui.selectable_label(false, &node.name);
        (arrow_resp, label_resp)
    });

    let (arrow_resp, label_resp) = row.inner;
    if arrow_resp.clicked() || label_resp.clicked() || row.response.clicked() {
        actions::toggle_directory(state, node);
    }

    if label_resp.secondary_clicked() || row.response.secondary_clicked() {
        actions::open_context_menu_at(
            state,
            &node.path.to_string(),
            true,
            ui.ctx().pointer_latest_pos(),
        );
    }

    if expanded || !q.is_empty() {
        if let Some(children) = &node.children {
            for c in children {
                if q.is_empty() || node_matches_query(c, q) {
                    render_node(ui, state, c, q, depth + 1);
                }
            }
        }
    }
}
