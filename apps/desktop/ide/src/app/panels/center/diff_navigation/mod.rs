//! # Smart Diff Navigation
//!
//! Panel for navigating through diff changes with smart features.

mod analysis;
mod badges;
mod changes_list;
mod current_change;
mod navigation_controls;

pub use analysis::analyze_diff;

use crate::app::state::IdeState;

pub(crate) fn render(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.heading("Smart Diff Navigation");
    ui.separator();

    navigation_controls::render_navigation_controls(ui, state);
    ui.separator();

    changes_list::render_changes_list(ui, state);
    ui.separator();

    if let Some(current_change) = state.diff_navigation.current_change() {
        current_change::render_current_change(ui, state, current_change);
    } else {
        ui.label("No changes to navigate");
    }
}
