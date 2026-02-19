//! # Render Methods
//!
//! Render methods for git graph component.

use crate::types::git_graph_types::*;
use egui::*;

use super::GitGraphComponent;

impl GitGraphComponent {
    /// Render the graph
    pub fn render(&mut self, ui: &mut egui::Ui) {
        // Toolbar
        self.render_toolbar(ui);
        ui.separator();

        // Graph area
        self.render_graph_area(ui);
    }

    /// Render toolbar
    fn render_toolbar(&mut self, ui: &mut egui::Ui) {
        ui.horizontal(|ui| {
            ui.label("View Mode:");
            ui.radio_value(&mut self.graph.view_mode, GraphViewMode::TwoD, "2D");
            ui.radio_value(&mut self.graph.view_mode, GraphViewMode::ThreeD, "3D");

            ui.separator();

            ui.label("Orientation:");
            ui.radio_value(
                &mut self.graph.layout.orientation,
                GraphOrientation::Horizontal,
                "Horizontal",
            );
            ui.radio_value(
                &mut self.graph.layout.orientation,
                GraphOrientation::Vertical,
                "Vertical",
            );

            ui.separator();

            if ui.button("Reset Zoom").clicked() {
                self.zoom = 1.0;
                self.pan = Vec2::ZERO;
            }

            ui.separator();

            if ui.button("Filters").clicked() {
                // Show filters dialog
            }
        });
    }

    /// Render graph area
    fn render_graph_area(&mut self, ui: &mut egui::Ui) {
        let desired_size = ui.available_size();
        let rect = ui.allocate_space(desired_size).1;

        // Apply zoom and pan
        let transform = emath::TSTransform::from_translation(self.pan)
            * emath::TSTransform::from_scaling(self.zoom);

        let painter = ui.painter_at(rect);

        // Draw commits
        for commit in &self.graph.commits {
            self.draw_commit(&painter, commit, transform);
        }

        // Draw connections (edges)
        self.draw_connections(&painter, transform);

        // Handle interaction
        self.handle_interaction(ui, rect);
    }
}
