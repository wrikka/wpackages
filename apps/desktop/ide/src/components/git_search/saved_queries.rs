//! # Saved Queries Rendering
//!
//! Rendering methods for saved queries.

use egui::*;

impl super::GitSearchComponent {
    /// Render saved queries
    pub fn render_saved_queries(&mut self, ui: &mut egui::Ui) {
        CollapsingHeader::new("Saved Queries").show(ui, |ui| {
            for query in &self.saved_queries {
                ui.horizontal(|ui| {
                    if ui.button("▶").clicked() {
                        // Load query
                        self.query = query.query.query.clone();
                        self.search_type = query.query.search_type.clone();
                        self.scope = query.query.scope.clone();
                    }

                    ui.label(&query.name);
                    ui.label(format!("({})", query.query.query));

                    ui.with_layout(Layout::right_to_left(egui::Align::Center), |ui| {
                        if ui.button("🗑").clicked() {
                            // Delete query
                        }
                    });
                });
            }
        });
    }
}
