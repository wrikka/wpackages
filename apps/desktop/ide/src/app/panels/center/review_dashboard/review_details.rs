use crate::app::state::IdeState;
use crate::types::review_dashboard::{ReviewPriority, ReviewStatus};

pub(crate) fn render_review_details(ui: &mut egui::Ui, state: &mut IdeState, review: &crate::types::review_dashboard::ReviewItem) {
    ui.separator();
    ui.heading("Review Details");
    ui.separator();
    
    ui.horizontal(|ui| {
        ui.heading(&review.commit_message);
        ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
            super::badges::render_priority_badge(ui, &review.priority);
            super::badges::render_status_badge(ui, &review.status);
        });
    });
    
    ui.horizontal(|ui| {
        ui.label(format!("Repository: {}", review.repo_name));
        ui.label(format!("Branch: {}", review.branch));
        ui.label(format!("Commit: {}", &review.commit_id[..7.min(review.commit_id.len())]));
    });
    
    ui.horizontal(|ui| {
        ui.label(format!("Author: {}", review.author));
        ui.label(format!("Created: {}", review.created_at.format("%Y-%m-%d %H:%M")));
    });
    
    ui.separator();
    
    ui.horizontal(|ui| {
        ui.label(format!("📝 {} files changed", review.files_changed));
        ui.label(format!("+{} insertions", review.insertions));
        ui.label(format!("-{} deletions", review.deletions));
    });
    
    if !review.labels.is_empty() {
        ui.separator();
        ui.label("Labels:");
        ui.horizontal(|ui| {
            for label in &review.labels {
                ui.label(format!("#{}", label));
            }
        });
    }
    
    ui.separator();
    ui.heading("Actions");
    ui.horizontal(|ui| {
        if ui.button("Approve").clicked() {
            crate::app::state::review_dashboard::ReviewDashboardService::update_review_status(
                state,
                &review.id,
                ReviewStatus::Approved,
            );
        }
        if ui.button("Request Changes").clicked() {
            crate::app::state::review_dashboard::ReviewDashboardService::update_review_status(
                state,
                &review.id,
                ReviewStatus::NeedsChanges,
            );
        }
        if ui.button("Reject").clicked() {
            crate::app::state::review_dashboard::ReviewDashboardService::update_review_status(
                state,
                &review.id,
                ReviewStatus::Rejected,
            );
        }
        if ui.button("Mark In Progress").clicked() {
            crate::app::state::review_dashboard::ReviewDashboardService::update_review_status(
                state,
                &review.id,
                ReviewStatus::InProgress,
            );
        }
    });
    
    ui.separator();
    if ui.button("Close Details").clicked() {
        state.review_dashboard.selected_review = None;
    }
}
