use crate::app::state::IdeState;
use crate::types::review_dashboard::ReviewSortBy::*;

pub(crate) fn render_sort_controls(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.horizontal(|ui| {
        ui.label("Sort by:");
        if ui.selectable_value(&mut state.review_dashboard.sort_by, CreatedAt, "Date").clicked() {
            crate::app::state::review_dashboard::ReviewDashboardService::sort_reviews(
                &mut state.review_dashboard.reviews,
                state.review_dashboard.sort_by,
                state.review_dashboard.sort_ascending,
            );
        }
        if ui.selectable_value(&mut state.review_dashboard.sort_by, Priority, "Priority").clicked() {
            crate::app::state::review_dashboard::ReviewDashboardService::sort_reviews(
                &mut state.review_dashboard.reviews,
                state.review_dashboard.sort_by,
                state.review_dashboard.sort_ascending,
            );
        }
        if ui.selectable_value(&mut state.review_dashboard.sort_by, Status, "Status").clicked() {
            crate::app::state::review_dashboard::ReviewDashboardService::sort_reviews(
                &mut state.review_dashboard.reviews,
                state.review_dashboard.sort_by,
                state.review_dashboard.sort_ascending,
            );
        }
        if ui.selectable_value(&mut state.review_dashboard.sort_by, RepoName, "Repo").clicked() {
            crate::app::state::review_dashboard::ReviewDashboardService::sort_reviews(
                &mut state.review_dashboard.reviews,
                state.review_dashboard.sort_by,
                state.review_dashboard.sort_ascending,
            );
        }

        ui.separator();

        ui.checkbox(&mut state.review_dashboard.sort_ascending, "Ascending");
    });
}
