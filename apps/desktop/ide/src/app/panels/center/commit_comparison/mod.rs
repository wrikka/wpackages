use crate::app::state::IdeState;

mod controls;
mod export;
mod git_ops;
mod results;

pub(crate) fn render(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.heading("Commit Comparison");
    ui.separator();

    controls::render_comparison_controls(ui, state);
    ui.separator();

    if let Some(comparison) = &state.commit_comparison.comparison {
        results::render_comparison_results(ui, state, comparison);
    } else {
        ui.label("Select commits or branches to compare");
    }
}
