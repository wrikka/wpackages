//! # Current Change Rendering
//!
//! Rendering methods for current diff change.

use crate::app::state::IdeState;

use super::badges::render_change_type_badge;

pub(crate) fn render_current_change(
    ui: &mut egui::Ui,
    state: &mut IdeState,
    change: &crate::types::diff_navigation::DiffChange,
) {
    ui.heading("Current Change");
    ui.separator();

    ui.horizontal(|ui| {
        ui.label(format!("File: {}", change.file_path));
        render_change_type_badge(ui, change.change_type);
        ui.label(format!("Lines: {}-{}", change.line_start, change.line_end));
    });

    ui.separator();

    ui.heading("Context");
    egui::ScrollArea::vertical()
        .id_salt("diff_context")
        .max_height(200.0)
        .show(ui, |ui| {
            for (idx, line) in change.context_lines.iter().enumerate() {
                let line_num = change.line_start + idx;

                match change.change_type {
                    crate::types::diff_navigation::ChangeType::Addition => {
                        ui.colored_label(
                            egui::Color32::from_rgb(34, 197, 94),
                            format!("+{}: {}", line_num, line),
                        );
                    }
                    crate::types::diff_navigation::ChangeType::Deletion => {
                        ui.colored_label(
                            egui::Color32::from_rgb(239, 68, 68),
                            format!("-{}: {}", line_num, line),
                        );
                    }
                    crate::types::diff_navigation::ChangeType::Modification => {
                        ui.colored_label(
                            egui::Color32::from_rgb(251, 191, 36),
                            format!("~{}: {}", line_num, line),
                        );
                    }
                    crate::types::diff_navigation::ChangeType::Context => {
                        ui.monospace(format!(" {}: {}", line_num, line));
                    }
                }
            }
        });

    ui.separator();

    ui.horizontal(|ui| {
        if ui.button("Open in Editor").clicked() {
            let full_path = format!("{}/{}", state.workspace.selected_repo.as_deref().unwrap_or(""), change.file_path);
            crate::app::actions::open_file(state, &full_path);
        }

        if ui.button("Copy Change").clicked() {
            let change_text = change.context_lines.join("\n");
            if let Err(e) = arboard::Clipboard::new().and_then(|mut cb| cb.set_text(&change_text)) {
                eprintln!("Failed to copy to clipboard: {}", e);
            }
        }
    });
}
