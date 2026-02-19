use crate::app::state::IdeState;
use crate::types::review_dashboard::{ReviewPriority, ReviewStatus};

pub(crate) fn render_filters(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.heading("Filters");
    ui.horizontal(|ui| {
        ui.label("Search:");
        ui.add(
            egui::TextEdit::singleline(&mut state.review_dashboard.filter.search)
                .hint_text("Search by message, author, or repo...")
                .desired_width(300.0),
        );

        ui.separator();

        ui.label("Status:");
        let mut status_none = state.review_dashboard.filter.status.is_none();
        if ui.checkbox(&mut status_none, "All").changed() {
            if status_none {
                state.review_dashboard.filter.status = None;
            }
        }
        if ui.selectable_value(
            &mut state.review_dashboard.filter.status,
            Some(ReviewStatus::Pending),
            "Pending",
        )
        .clicked()
        {}
        if ui.selectable_value(
            &mut state.review_dashboard.filter.status,
            Some(ReviewStatus::InProgress),
            "In Progress",
        )
        .clicked()
        {}
        if ui.selectable_value(
            &mut state.review_dashboard.filter.status,
            Some(ReviewStatus::Approved),
            "Approved",
        )
        .clicked()
        {}
    });

    ui.horizontal(|ui| {
        ui.label("Priority:");
        let mut priority_none = state.review_dashboard.filter.priority.is_none();
        if ui.checkbox(&mut priority_none, "All").changed() {
            if priority_none {
                state.review_dashboard.filter.priority = None;
            }
        }
        if ui.selectable_value(
            &mut state.review_dashboard.filter.priority,
            Some(ReviewPriority::Critical),
            "Critical",
        )
        .clicked()
        {}
        if ui.selectable_value(
            &mut state.review_dashboard.filter.priority,
            Some(ReviewPriority::High),
            "High",
        )
        .clicked()
        {}
        if ui.selectable_value(
            &mut state.review_dashboard.filter.priority,
            Some(ReviewPriority::Medium),
            "Medium",
        )
        .clicked()
        {}
    });

    ui.horizontal(|ui| {
        if ui.button("Clear Filters").clicked() {
            state.review_dashboard.filter = Default::default();
        }
        if ui.button("Apply Filters").clicked() {
            let filtered = crate::app::state::review_dashboard::ReviewDashboardService::filter_reviews(
                &state.review_dashboard.reviews.clone(),
                &state.review_dashboard.filter,
            );
        }
    });
}
