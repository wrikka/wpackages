//! # Code Review Checklist
//!
//! Panel for managing code review checklists.

mod badges;
mod checklist;
mod creation;
mod item;
mod items;

pub use creation::create_new_checklist;

use crate::app::state::IdeState;

pub(crate) fn render(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.heading("Code Review Checklist");
    ui.separator();

    ui.horizontal(|ui| {
        if ui.button("New Checklist").clicked() {
            create_new_checklist(state);
        }

        ui.checkbox(&mut state.review_checklist.show_completed, "Show Completed");

        if !state.review_checklist.filter_category.is_some() {
            ui.menu_button("Filter by Category", |ui| {
                if ui.button("All").clicked() {
                    state.review_checklist.filter_category = None;
                    ui.close_menu();
                }
                ui.separator();
                let categories = vec!["Testing", "Code Review", "Documentation", "Performance", "Security"];
                for category in categories {
                    if ui.button(category).clicked() {
                        state.review_checklist.filter_category = Some(category.to_string());
                        ui.close_menu();
                    }
                }
            });
        }
    });

    ui.separator();

    if state.review_checklist.checklists.is_empty() {
        ui.label("No checklists. Click 'New Checklist' to create one.");
        return;
    }

    egui::ScrollArea::vertical()
        .id_salt("review_checklists")
        .max_height(500.0)
        .show(ui, |ui| {
            for checklist in &state.review_checklist.checklists {
                checklist::render_checklist(ui, state, checklist);
                ui.add_space(12.0);
            }
        });
}
