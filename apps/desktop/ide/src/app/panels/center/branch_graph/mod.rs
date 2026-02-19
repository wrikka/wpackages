//! # Interactive Branch Graph
//!
//! Panel for visualizing Git branch graph with interactive features.

mod canvas;
mod controls;
mod refresh;
mod tooltip;

pub use refresh::refresh_graph;

use crate::app::state::IdeState;

pub(crate) fn render(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.heading("Interactive Branch Graph");
    ui.separator();

    controls::render_controls(ui, state);
    ui.separator();

    canvas::render_graph_canvas(ui, state);
}
