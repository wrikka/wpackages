//! # File Controls Rendering
//!
//! Rendering methods for file tree controls.

use crate::app::{actions, state::IdeState};

pub(crate) fn render_file_controls(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.horizontal(|ui| {
        ui.add(
            egui::TextEdit::singleline(&mut state.fs.file_search)
                .hint_text("Search files...")
                .desired_width(f32::INFINITY),
        );
    });

    ui.horizontal(|ui| {
        if ui.button("New File").clicked() {
            actions::begin_new_entry(state, false);
        }
        if ui.button("New Folder").clicked() {
            actions::begin_new_entry(state, true);
        }

        ui.separator();
        ui.checkbox(&mut state.fs.show_file_size, "Size");
        ui.checkbox(&mut state.fs.show_file_lines, "Lines");
    });
}
