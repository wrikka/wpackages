//! # Change Type Badges
//!
//! Rendering utilities for change type badges.

pub(crate) fn render_change_type_badge(
    ui: &mut egui::Ui,
    change_type: crate::types::diff_navigation::ChangeType,
) {
    let (text, color) = match change_type {
        crate::types::diff_navigation::ChangeType::Addition => {
            ("ADDITION", egui::Color32::from_rgb(34, 197, 94))
        }
        crate::types::diff_navigation::ChangeType::Deletion => {
            ("DELETION", egui::Color32::from_rgb(239, 68, 68))
        }
        crate::types::diff_navigation::ChangeType::Modification => {
            ("MODIFICATION", egui::Color32::from_rgb(251, 191, 36))
        }
        crate::types::diff_navigation::ChangeType::Context => ("CONTEXT", egui::Color32::GRAY),
    };

    ui.colored_label(color, text);
}
