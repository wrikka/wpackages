//! # Diff Changes List
//!
//! Rendering methods for diff changes list.

use crate::app::state::IdeState;

use super::badges::render_change_type_badge;

pub(crate) fn render_changes_list(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.heading("Changes");

    if state.diff_navigation.changes.is_empty() {
        ui.label("No changes detected");
        return;
    }

    egui::ScrollArea::vertical()
        .id_salt("diff_changes")
        .max_height(300.0)
        .show(ui, |ui| {
            for (idx, change) in state.diff_navigation.changes.iter().enumerate() {
                let is_current = state.diff_navigation.current_change_index == Some(idx);

                ui.group(|ui| {
                    ui.horizontal(|ui| {
                        if ui.selectable_label(is_current, &format!("{}.", idx + 1)).clicked() {
                            state.diff_navigation.go_to_change(idx);
                        }

                        render_change_type_badge(ui, change.change_type);

                        ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                            ui.label(format!("Line {}-{}", change.line_start, change.line_end));
                        });
                    });

                    ui.label(&change.file_path);

                    if ui.button("Go to Change").clicked() {
                        state.diff_navigation.go_to_change(idx);
                        // TODO: Implement editor navigation integration
                        // - Navigate to the change in the editor
                        // - Highlight the specific change
                        // - Scroll to the change location
                        // For now, this is a placeholder that would be replaced with actual navigation
                    }
                });

                ui.add_space(4.0);
            }
        });
}
