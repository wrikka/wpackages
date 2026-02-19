//! # Review Checklist Rendering
//!
//! Rendering methods for individual review checklists.

use crate::app::state::IdeState;
use review_checklist::{ChecklistState, ReviewChecklist};

use super::badges::render_state_badge;
use super::items::render_checklist_items;

pub(crate) fn render_checklist(
    ui: &mut egui::Ui,
    state: &mut IdeState,
    checklist: &ReviewChecklist,
) {
    let selected = state.review_checklist.selected_checklist.as_ref() == Some(&checklist.id);
    let checklist_state = checklist.get_state();
    let (completed, total) = checklist.get_progress();
    let progress = checklist.get_progress_percentage();

    ui.group(|ui| {
        ui.horizontal(|ui| {
            ui.selectable_label(selected, &checklist.pr_id);

            ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                render_state_badge(ui, checklist_state);
                ui.label(format!("{:.0}%", progress));
            });
        });

        ui.label(format!("{}: {}", checklist.repo_name, checklist.branch));

        if let Some(reviewer) = &checklist.reviewer {
            ui.label(format!("Reviewer: {}", reviewer));
        }

        ui.separator();

        // Progress bar
        let progress_rect = ui.available_rect_before_wrap();
        let bar_height = 8.0;
        ui.add_space(bar_height + 4.0);

        let painter = ui.painter_at(progress_rect);
        let bar_rect = egui::Rect::from_min_max(
            progress_rect.min,
            progress_rect.min + egui::vec2(progress_rect.width(), bar_height),
        );

        painter.rect_filled(bar_rect, 0.0, egui::Color32::from_rgb(229, 231, 235));

        if total > 0 {
            let filled_width = bar_rect.width() * (progress / 100.0);
            let filled_rect = egui::Rect::from_min_max(
                bar_rect.min,
                bar_rect.min + egui::vec2(filled_width, bar_height),
            );

            let color = match checklist_state {
                ChecklistState::Completed => egui::Color32::GREEN,
                ChecklistState::Blocked => egui::Color32::RED,
                ChecklistState::InProgress => egui::Color32::from_rgb(59, 130, 246),
                _ => egui::Color32::from_rgb(251, 191, 36),
            };

            painter.rect_filled(filled_rect, 0.0, color);
        }

        ui.add_space(4.0);
        ui.label(format!("{}/{} items completed", completed, total));

        if ui.button("View Details").clicked() {
            state.review_checklist.selected_checklist = Some(checklist.id.clone());
        }
    });

    if selected {
        ui.indent(|ui| {
            render_checklist_items(ui, state, checklist);
        });
    }
}
