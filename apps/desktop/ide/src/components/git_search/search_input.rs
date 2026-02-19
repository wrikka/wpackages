//! # Search Input Rendering
//!
//! Rendering methods for search input.

use crate::types::git_search_types::*;
use egui::*;

impl super::GitSearchComponent {
    /// Render search input
    pub fn render_search_input(&mut self, ui: &mut egui::Ui) {
        ui.horizontal(|ui| {
            ui.label("Query:");
            let response = ui.add_sized(
                [ui.available_width() - 200.0, 20.0],
                TextEdit::singleline(&mut self.query).hint_text("Enter search query..."),
            );

            if response.lost_focus() && ui.input(|i| i.key_pressed(egui::Key::Enter)) {
                // Trigger search
            }

            if ui.button("Search").clicked() {
                // Trigger search
            }

            if ui.button("Save").clicked() && !self.query.is_empty() {
                // Save query
            }
        });

        ui.horizontal(|ui| {
            ui.label("Type:");
            ui.radio_value(&mut self.search_type, SearchType::Text, "Text");
            ui.radio_value(&mut self.search_type, SearchType::Regex, "Regex");
            ui.radio_value(&mut self.search_type, SearchType::Semantic, "Semantic");
            ui.radio_value(&mut self.search_type, SearchType::Fuzzy, "Fuzzy");

            ui.separator();

            ui.label("Scope:");
            ui.radio_value(&mut self.scope, SearchScope::All, "All");
            ui.radio_value(&mut self.scope, SearchScope::Commits, "Commits");
            ui.radio_value(&mut self.scope, SearchScope::Files, "Files");
            ui.radio_value(&mut self.scope, SearchScope::Branches, "Branches");

            ui.separator();

            if ui
                .button(if self.show_advanced {
                    "Advanced ▲"
                } else {
                    "Advanced ▼"
                })
                .clicked()
            {
                self.show_advanced = !self.show_advanced;
            }
        });
    }
}
