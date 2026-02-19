//! # Badge Rendering Utilities
//!
//! Rendering utilities for checklist badges.

use review_checklist::{ChecklistState, ItemPriority};

pub(crate) fn render_state_badge(ui: &mut egui::Ui, state: ChecklistState) {
    let (text, color) = match state {
        ChecklistState::NotStarted => ("NOT STARTED", egui::Color32::GRAY),
        ChecklistState::InProgress => ("IN PROGRESS", egui::Color32::from_rgb(59, 130, 246)),
        ChecklistState::Completed => ("COMPLETED", egui::Color32::GREEN),
        ChecklistState::Blocked => ("BLOCKED", egui::Color32::RED),
    };

    ui.colored_label(color, text);
}

pub(crate) fn render_priority_badge(ui: &mut egui::Ui, priority: ItemPriority) {
    let (text, color) = match priority {
        ItemPriority::Critical => ("CRITICAL", egui::Color32::RED),
        ItemPriority::High => ("HIGH", egui::Color32::from_rgb(251, 191, 36)),
        ItemPriority::Medium => ("MEDIUM", egui::Color32::from_rgb(59, 130, 246)),
        ItemPriority::Low => ("LOW", egui::Color32::GRAY),
    };

    ui.colored_label(color, text);
}
