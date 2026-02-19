//! # Diff Navigation Controls
//!
//! Rendering methods for diff navigation controls.

use crate::app::state::IdeState;

pub(crate) fn render_navigation_controls(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.horizontal(|ui| {
        if ui.button("⬅ Previous").clicked() {
            state.diff_navigation.previous_change();
        }

        if ui.button("Next ➡").clicked() {
            state.diff_navigation.next_change();
        }

        ui.separator();

        ui.label(format!(
            "{}/{}",
            state.diff_navigation.current_change_index.map_or(0, |i| i + 1),
            state.diff_navigation.total_changes
        ));

        ui.separator();

        ui.checkbox(&mut state.diff_navigation.wrap_around, "Wrap Around");
        ui.checkbox(&mut state.diff_navigation.highlight_current, "Highlight Current");
    });
}
