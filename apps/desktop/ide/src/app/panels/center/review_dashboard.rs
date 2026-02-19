mod review_dashboard;

use crate::app::state::IdeState;

pub(crate) fn render(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.heading("Multi-Repo Code Review Dashboard");
    ui.separator();

    review_dashboard::render_stats(ui, state);
    ui.separator();

    review_dashboard::render_filters(ui, state);
    ui.separator();

    review_dashboard::render_sort_controls(ui, state);
    ui.separator();

    review_dashboard::render_reviews_list(ui, state);

    if let Some(review_id) = &state.review_dashboard.selected_review.clone() {
        if let Some(review) = state
            .review_dashboard
            .reviews
            .iter()
            .find(|r| r.id == *review_id)
        {
            review_dashboard::render_review_details(ui, state, review);
        }
    }
}
