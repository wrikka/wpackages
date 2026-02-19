//! # Checklist Items Rendering
//!
//! Rendering methods for checklist items.

use crate::app::state::IdeState;
use review_checklist::ReviewChecklist;

use super::item::render_item;

pub(crate) fn render_checklist_items(
    ui: &mut egui::Ui,
    state: &mut IdeState,
    checklist: &ReviewChecklist,
) {
    ui.heading("Items");

    for item in &checklist.items {
        if !state.review_checklist.show_completed && item.is_complete() {
            continue;
        }

        render_item(ui, state, checklist, item);
        ui.add_space(4.0);
    }
}
