//! # Projects Rendering
//!
//! Rendering methods for project selection.

use crate::app::{actions, state::IdeState};

pub(crate) fn render_projects(ui: &mut egui::Ui, state: &mut IdeState) {
    let mut next_selected_project: Option<usize> = None;
    for (idx, p) in state.workspace.projects.iter().enumerate() {
        let selected = state.workspace.selected_project == Some(idx);
        if ui.selectable_label(selected, p).clicked() {
            next_selected_project = Some(idx);
        }
    }

    if let Some(idx) = next_selected_project {
        actions::select_project(state, idx);
    }
}
