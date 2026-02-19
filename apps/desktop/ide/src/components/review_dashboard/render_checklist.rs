//! # Render Checklist
//!
//! Render method for review dashboard checklist.

use crate::types::review_dashboard_types::*;
use egui::*;

/// Render checklist
pub fn render_checklist(checklist: &mut [ChecklistItem], ui: &mut egui::Ui) {
    CollapsingHeader::new("Review Checklist")
        .default_open(true)
        .show(ui, |ui| {
            for item in checklist {
                ui.horizontal(|ui| {
                    if ui.checkbox(&mut item.checked, &item.title).changed() {
                        // Checkbox state changed
                    }
                    ui.label(&item.description);
                    ui.label(format!("[{:?}]", item.category));
                });
            }
        });
}
