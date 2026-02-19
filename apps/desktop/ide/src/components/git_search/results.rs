//! # Results Rendering
//!
//! Rendering methods for search results.

use crate::components::utils::relevance_score_color;
use crate::types::git_search_types::*;
use egui::*;

impl super::GitSearchComponent {
    /// Render search results
    pub fn render_results(&mut self, ui: &mut egui::Ui) {
        CollapsingHeader::new(format!("Results ({})", self.results.len()))
            .default_open(true)
            .show(ui, |ui| {
                ScrollArea::vertical()
                    .max_height(400.0)
                    .show(ui, |ui| {
                        for (i, result) in self.results.iter().enumerate() {
                            let is_selected = self.selected_result == Some(i);
                            let response = ui.group(|ui| {
                                ui.horizontal(|ui| {
                                    // Result type icon
                                    let icon = match result.result_type {
                                        SearchResultType::Commit => "📝",
                                        SearchResultType::File => "📄",
                                        SearchResultType::Branch => "🌿",
                                    };
                                    ui.label(icon);

                                    // Title
                                    ui.label(&result.title);

                                    // Relevance score
                                    ui.with_layout(
                                        Layout::right_to_left(egui::Align::Center),
                                        |ui| {
                                            let score_color =
                                                relevance_score_color(result.relevance_score);
                                            ui.colored_label(
                                                score_color,
                                                format!("{:.0}%", result.relevance_score * 100.0),
                                            );
                                        },
                                    );
                                });

                                // Snippet
                                ui.label(&result.snippet);

                                // Metadata
                                ui.horizontal(|ui| {
                                    if let Some(ref author) = result.metadata.author {
                                        ui.label(format!("Author: {}", author));
                                    }

                                    if let Some(ref timestamp) = result.metadata.timestamp {
                                        ui.label(
                                            format!("Time: {}", timestamp.format("%Y-%m-%d %H:%M")),
                                        );
                                    }

                                    if let Some(ref file_path) = result.metadata.file_path {
                                        ui.label(format!("File: {}", file_path));
                                    }

                                    if let Some(ref branch) = result.metadata.branch {
                                        ui.label(format!("Branch: {}", branch));
                                    }
                                });
                            });

                            if response.hovered() {
                                if ui.input(|i| i.pointer.any_clicked()) {
                                    self.selected_result = Some(i);
                                }
                            }
                        }
                    });
            });
    }
}
