//! # Repositories Rendering
//!
//! Rendering methods for repository selection.

use crate::app::{actions, state::IdeState};

pub(crate) fn render_repositories(ui: &mut egui::Ui, state: &mut IdeState) {
    if let Some(project_idx) = state.workspace.selected_project {
        if let Some(repos) = state.workspace.repos_by_project.get(project_idx) {
            let mut next_selected_repo = None;
            for r in repos.iter() {
                let selected = state.workspace.selected_repo.as_ref() == Some(&r.root);
                if ui.selectable_label(selected, &r.name).clicked() {
                    next_selected_repo = Some(r.clone());
                }
            }

            if let Some(r) = next_selected_repo {
                actions::select_repo(state, r);
            }
        }
    }
}
