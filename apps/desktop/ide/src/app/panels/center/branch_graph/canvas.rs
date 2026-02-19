//! # Branch Graph Canvas
//!
//! Rendering methods for branch graph canvas.

use crate::app::state::IdeState;
use egui::Vec2;

use super::tooltip::render_node_tooltip;

pub(crate) fn render_graph_canvas(ui: &mut egui::Ui, state: &mut IdeState) {
    let desired_size = Vec2::new(ui.available_width(), ui.available_height());
    let response = ui.allocate_response(desired_size, egui::Sense::click_and_drag());

    let painter = ui.painter_at(response.rect);

    if let Some(graph) = &state.branch_graph.graph {
        let offset = Vec2::new(state.branch_graph.offset.0, state.branch_graph.offset.1);

        if let Err(e) = state.branch_graph.renderer.render(
            &painter,
            graph,
            offset,
            state.branch_graph.zoom,
        ) {
            state.set_error(format!("Graph render error: {}", e));
        }

        if response.dragged() {
            state.branch_graph.offset.0 += response.drag_delta().x;
            state.branch_graph.offset.1 += response.drag_delta().y;
        }

        if response.hovered() {
            if let Some(scroll) = ui.input(|i| i.scroll_delta) {
                let zoom_factor = if scroll.y > 0.0 { 1.1 } else { 0.9 };
                state.branch_graph.zoom = (state.branch_graph.zoom * zoom_factor).clamp(0.1, 3.0);
            }
        }

        if response.clicked() {
            if let Some(pos) = response.hover_pos() {
                let offset = Vec2::new(state.branch_graph.offset.0, state.branch_graph.offset.1);

                if let Some(node) = state.branch_graph.renderer.get_node_at_position(
                    graph,
                    pos,
                    offset,
                    state.branch_graph.zoom,
                ) {
                    state.branch_graph.selected_node = Some(node.id.commit_id.clone());
                } else {
                    state.branch_graph.selected_node = None;
                }
            }
        }
    } else {
        ui.centered_and_justified(|ui| {
            ui.label("No repository selected");
        });
    }

    if let Some(selected_id) = &state.branch_graph.selected_node {
        if let Some(graph) = &state.branch_graph.graph {
            if let Some(node) = graph.get_node(&git_graph::GraphNodeId::new(selected_id.clone())) {
                render_node_tooltip(ui, node, response.rect);
            }
        }
    }
}
