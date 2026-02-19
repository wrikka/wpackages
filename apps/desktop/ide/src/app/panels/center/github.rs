use crate::app::state::IdeState;

pub(crate) fn render(ui: &mut egui::Ui, state: &mut IdeState) {
    if let Some(action) = github::show(ui, &mut state.github) {
        match action {
            github::GitHubAction::LoadProfile(_profile) => {
                state.set_error("GitHub: load profile not implemented");
            }
            github::GitHubAction::ProfileDataLoaded(_result) => {}
        }
    }
}
