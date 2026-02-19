//! # Branch Graph Tooltip
//!
//! Rendering methods for branch graph node tooltip.

pub(crate) fn render_node_tooltip(ui: &mut egui::Ui, node: &git_graph::GraphNode, rect: egui::Rect) {
    let tooltip_rect = egui::Rect::from_min_max(
        rect.min + egui::Vec2::new(10.0, 10.0),
        rect.min + egui::Vec2::new(400.0, 300.0),
    );

    egui::Area::new("node_tooltip".into())
        .order(egui::Order::Tooltip)
        .fixed_pos(tooltip_rect.min)
        .show(ui.ctx(), |ui| {
            egui::Window::new("Commit Details")
                .collapsible(false)
                .resizable(false)
                .fixed_pos(tooltip_rect.min)
                .show(ui.ctx(), |ui| {
                    ui.label(format!("Commit: {}", node.id.short_id()));
                    ui.separator();
                    ui.label(format!("Message: {}", node.message));
                    ui.label(format!("Author: {}", node.author));
                    ui.label(format!("Date: {}", node.date.format("%Y-%m-%d %H:%M:%S")));

                    if !node.branches.is_empty() {
                        ui.separator();
                        ui.label("Branches:");
                        for branch in &node.branches {
                            ui.label(format!("  - {}", branch));
                        }
                    }

                    if !node.tags.is_empty() {
                        ui.separator();
                        ui.label("Tags:");
                        for tag in &node.tags {
                            ui.label(format!("  - {}", tag));
                        }
                    }

                    if node.is_head {
                        ui.separator();
                        ui.colored_label(egui::Color32::GREEN, "● HEAD");
                    }

                    if node.is_merge {
                        ui.colored_label(egui::Color32::from_rgb(147, 51, 234), "● Merge Commit");
                    }
                });
        });
}
