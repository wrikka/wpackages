use crate::app::state::dependency_graph::{DependencyGraphState, GraphLayout};
use egui::{Context, Ui, Color32};

pub fn render_dependency_graph_panel(
    ctx: &Context,
    state: &mut DependencyGraphState,
) {
    egui::Window::new("🔗 Dependency Graph")
        .collapsible(true)
        .resizable(true)
        .default_size([800.0, 600.0])
        .show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.label("Layout:");
                ui.radio_value(&mut state.layout, GraphLayout::Hierarchical, "Hierarchical");
                ui.radio_value(&mut state.layout, GraphLayout::ForceDirected, "Force-Directed");
                ui.radio_value(&mut state.layout, GraphLayout::Circular, "Circular");
                ui.radio_value(&mut state.layout, GraphLayout::Tree, "Tree");
            });

            ui.horizontal(|ui| {
                ui.checkbox(&mut state.show_labels, "Show Labels");
            });

            ui.separator();

            if let Some(graph) = &state.graph {
                if let Some(selected) = &state.selected_node {
                    ui.label(format!("Selected: {}", selected));
                }

                ui.separator();

                render_graph_canvas(ui, graph, state);
            } else {
                ui.label("No graph loaded. Build a dependency graph to visualize.");
            }
        });
}

fn render_graph_canvas(ui: &mut Ui, graph: &crate::app::state::dependency_graph::DependencyGraph, state: &DependencyGraphState) {
    let painter = ui.painter();

    let rect = ui.available_size();
    let center = rect / 2.0;

    let node_radius = 20.0;
    let node_spacing = 60.0;

    for (i, node) in graph.nodes.iter().enumerate() {
        let angle = (i as f32) * 2.0 * std::f32::consts::PI / graph.nodes.len() as f32;
        let x = center.x + angle.cos() * 150.0;
        let y = center.y + angle.sin() * 150.0;

        let pos = egui::pos2(x, y);

        let color = if state.selected_node.as_ref() == Some(&node.id) {
            Color32::LIGHT_BLUE
        } else {
            Color32::LIGHT_GRAY
        };

        painter.circle_filled(pos, node_radius, color);

        if state.show_labels {
            painter.text(
                egui::pos2(x, y + node_radius + 15.0),
                egui::Align2::CENTER_CENTER,
                &node.name,
                egui::FontId::default(),
                Color32::WHITE,
            );
        }
    }

    for edge in &graph.edges {
        if let (Some(from_node), Some(to_node)) = (
            graph.nodes.iter().find(|n| n.id == edge.from),
            graph.nodes.iter().find(|n| n.id == edge.to),
        ) {
            let from_idx = graph.nodes.iter().position(|n| n.id == edge.from).unwrap();
            let to_idx = graph.nodes.iter().position(|n| n.id == edge.to).unwrap();

            let from_angle = (from_idx as f32) * 2.0 * std::f32::consts::PI / graph.nodes.len() as f32;
            let to_angle = (to_idx as f32) * 2.0 * std::f32::consts::PI / graph.nodes.len() as f32;

            let from_x = center.x + from_angle.cos() * 150.0;
            let from_y = center.y + from_angle.sin() * 150.0;
            let to_x = center.x + to_angle.cos() * 150.0;
            let to_y = center.y + to_angle.sin() * 150.0;

            painter.line_segment(
                [egui::pos2(from_x, from_y), egui::pos2(to_x, to_y)],
                (2.0, Color32::LIGHT_GRAY),
            );
        }
    }
}
