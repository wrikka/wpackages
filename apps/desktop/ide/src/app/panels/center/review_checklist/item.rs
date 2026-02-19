//! # Individual Item Rendering
//!
//! Rendering methods for individual checklist items.

use crate::app::state::IdeState;
use review_checklist::{ChecklistItem, ItemStatus, ReviewChecklist};

use super::badges::render_priority_badge;

pub(crate) fn render_item(
    ui: &mut egui::Ui,
    state: &mut IdeState,
    checklist: &ReviewChecklist,
    item: &ChecklistItem,
) {
    ui.group(|ui| {
        ui.horizontal(|ui| {
            ui.selectable_value(&mut item.status, ItemStatus::Pending, "Pending");
            ui.selectable_value(&mut item.status, ItemStatus::InProgress, "In Progress");
            ui.selectable_value(&mut item.status, ItemStatus::Completed, "Completed");
            ui.selectable_value(&mut item.status, ItemStatus::Skipped, "Skipped");
        });

        ui.heading(&item.title);

        if let Some(description) = &item.description {
            ui.label(description);
        }

        ui.horizontal(|ui| {
            ui.label(format!("Category: {}", item.category));
            render_priority_badge(ui, item.priority);
        });

        if let Some(assignee) = &item.assignee {
            ui.label(format!("Assignee: {}", assignee));
        }

        if let Some(notes) = &item.notes {
            ui.label(format!("Notes: {}", notes));
        }
    });
}
