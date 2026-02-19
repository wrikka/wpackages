//! # Interaction Logic
//!
//! Interaction logic for git graph component.

use crate::types::git_graph_types::*;
use egui::*;

use super::GitGraphComponent;

impl GitGraphComponent {
    /// Handle user interaction
    pub fn handle_interaction(&mut self, ui: &mut egui::Ui, rect: Rect) {
        let response = ui.interact(rect, ui.id(), egui::Sense::click_and_drag());

        // Handle zoom
        if response.hovered() {
            let scroll_delta = ui.input(|i| i.scroll_delta);
            if scroll_delta.y != 0.0 {
                let zoom_factor = if scroll_delta.y > 0.0 { 0.9 } else { 1.1 };
                self.zoom = (self.zoom * zoom_factor).clamp(0.1, 5.0);
            }
        }

        // Handle pan
        if response.dragged() {
            self.pan += response.drag_delta();
        }

        // Handle click
        if response.clicked() {
            let click_pos = response.hover_pos().unwrap_or(Pos2::ZERO);
            let transform = emath::TSTransform::from_translation(self.pan)
                * emath::TSTransform::from_scaling(self.zoom);

            // Find clicked commit
            let inverse_transform = transform.inverse();
            let local_pos = inverse_transform.transform_pos(click_pos);

            for commit in &self.graph.commits {
                let commit_pos = pos2(commit.position.x as f32, commit.position.y as f32);
                if local_pos.distance(commit_pos) < 10.0 {
                    self.interaction.selected_commit = Some(commit.hash.clone());
                    break;
                }
            }
        }
    }
}
