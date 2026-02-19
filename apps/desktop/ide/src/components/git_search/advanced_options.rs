//! # Advanced Options Rendering
//!
//! Rendering methods for advanced search options.

use egui::*;

impl super::GitSearchComponent {
    /// Render advanced options
    pub fn render_advanced_options(&mut self, ui: &mut egui::Ui) {
        CollapsingHeader::new("Advanced Options").show(ui, |ui| {
            ui.horizontal(|ui| {
                ui.label("Author:");
                ui.text_edit_singleline(&mut String::new()); // Placeholder
            });

            ui.horizontal(|ui| {
                ui.label("File Pattern:");
                ui.text_edit_singleline(&mut String::new()); // Placeholder
            });

            ui.horizontal(|ui| {
                ui.label("Branch:");
                ui.text_edit_singleline(&mut String::new()); // Placeholder
            });

            ui.horizontal(|ui| {
                ui.label("Language:");
                ui.text_edit_singleline(&mut String::new()); // Placeholder
            });

            ui.horizontal(|ui| {
                ui.label("Max Results:");
                ui.add(Slider::new(&mut 100, 10..=1000));
            });
        });
    }
}
