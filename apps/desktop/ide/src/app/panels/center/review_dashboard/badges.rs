use crate::types::review_dashboard::{ReviewPriority, ReviewStatus};

pub(crate) fn render_priority_badge(ui: &mut egui::Ui, priority: &ReviewPriority) {
    let (text, color) = match priority {
        ReviewPriority::Critical => ("CRITICAL", egui::Color32::RED),
        ReviewPriority::High => ("HIGH", egui::Color32::from_rgb(255, 165, 0)),
        ReviewPriority::Medium => ("MEDIUM", egui::Color32::from_rgb(255, 255, 0)),
        ReviewPriority::Low => ("LOW", egui::Color32::GREEN),
    };
    
    ui.colored_label(color, text);
}

pub(crate) fn render_status_badge(ui: &mut egui::Ui, status: &ReviewStatus) {
    let (text, color) = match status {
        ReviewStatus::Pending => ("PENDING", egui::Color32::GRAY),
        ReviewStatus::InProgress => ("IN PROGRESS", egui::Color32::from_rgb(0, 120, 215)),
        ReviewStatus::Approved => ("APPROVED", egui::Color32::GREEN),
        ReviewStatus::Rejected => ("REJECTED", egui::Color32::RED),
        ReviewStatus::NeedsChanges => ("NEEDS CHANGES", egui::Color32::from_rgb(255, 165, 0)),
    };
    
    ui.colored_label(color, text);
}
