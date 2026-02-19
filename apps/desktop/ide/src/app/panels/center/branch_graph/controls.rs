//! # Branch Graph Controls
//!
//! Rendering methods for branch graph controls.

use crate::app::state::IdeState;

use super::refresh::refresh_graph;

pub(crate) fn render_controls(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.horizontal(|ui| {
        ui.label("Zoom:");
        ui.add(egui::Slider::new(&mut state.branch_graph.zoom, 0.1..=3.0).logarithmic(true));

        ui.separator();

        if ui.button("Reset View").clicked() {
            state.branch_graph.offset = (20.0, 20.0);
            state.branch_graph.zoom = 1.0;
        }

        ui.separator();

        ui.checkbox(&mut state.branch_graph.show_branches, "Show Branches");
        ui.checkbox(&mut state.branch_graph.show_tags, "Show Tags");
        ui.checkbox(&mut state.branch_graph.show_commits, "Show Commits");
    });

    ui.horizontal(|ui| {
        ui.label("Max Commits:");
        ui.add(egui::Slider::new(&mut state.branch_graph.max_commits, 10..=500));

        if ui.button("Refresh").clicked() {
            if let Some(repo_root) = &state.workspace.selected_repo {
                refresh_graph(state, repo_root);
            }
        }
    });
}
