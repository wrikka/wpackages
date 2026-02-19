//! # Drawing Logic
//!
//! Drawing logic for git graph component.

use crate::types::git_graph_types::*;
use egui::*;

use super::GitGraphComponent;

impl GitGraphComponent {
    /// Draw a single commit node
    pub fn draw_commit(&self, painter: &Painter, commit: &CommitNode, transform: emath::TSTransform) {
        let pos = transform.transform_pos(pos2(
            commit.position.x as f32,
            commit.position.y as f32,
        ));

        let radius = 8.0 * self.zoom;

        // Determine color based on commit metadata
        let color = if commit.metadata.is_merge {
            Color32::from_rgb(100, 149, 237) // Cornflower blue for merges
        } else if commit.metadata.has_conflicts {
            Color32::RED
        } else if commit.metadata.is_head {
            Color32::GREEN
        } else {
            Color32::LIGHT_BLUE
        };

        // Draw commit circle
        painter.circle_filled(pos, radius, color);

        // Draw selection highlight
        if self.interaction.selected_commit.as_ref() == Some(&commit.hash) {
            painter.circle_stroke(pos, radius + 2.0, Stroke::new(2.0, Color32::YELLOW));
        }

        // Draw hover highlight
        if self.interaction.hovered_commit.as_ref() == Some(&commit.hash) {
            painter.circle_stroke(pos, radius + 2.0, Stroke::new(2.0, Color32::LIGHT_GRAY));
        }

        // Draw label if enabled
        if self.graph.layout.show_labels {
            let label_pos = pos + vec2(radius + 5.0, 0.0);
            painter.text(
                label_pos,
                Align2::LEFT_CENTER,
                &commit.hash[..7],
                FontId::default(),
                Color32::WHITE,
            );

            if self.graph.layout.show_authors {
                let author_pos = label_pos + vec2(0.0, 12.0);
                painter.text(
                    author_pos,
                    Align2::LEFT_CENTER,
                    &commit.author,
                    FontId::proportional(10.0),
                    Color32::GRAY,
                );
            }
        }
    }

    /// Draw connections between commits
    pub fn draw_connections(&self, painter: &Painter, transform: emath::TSTransform) {
        for commit in &self.graph.commits {
            let start_pos = transform.transform_pos(pos2(
                commit.position.x as f32,
                commit.position.y as f32,
            ));

            for parent_hash in &commit.parents {
                if let Some(parent) = self.graph.commits.iter().find(|c| &c.hash == parent_hash) {
                    let end_pos = transform.transform_pos(pos2(
                        parent.position.x as f32,
                        parent.position.y as f32,
                    ));

                    // Draw line
                    painter.line_segment(
                        [start_pos, end_pos],
                        Stroke::new(2.0 * self.zoom, Color32::GRAY),
                    );

                    // Draw arrow
                    let direction = (end_pos - start_pos).normalized();
                    let arrow_size = 5.0 * self.zoom;
                    let perp = vec2(-direction.y, direction.x) * arrow_size;

                    let arrow_tip = end_pos - direction * arrow_size;
                    painter.polygon_filled(
                        vec![
                            end_pos,
                            arrow_tip + perp,
                            arrow_tip - perp,
                        ],
                        Color32::GRAY,
                    );
                }
            }
        }
    }
}
