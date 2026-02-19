//! # File Tree Panel
//!
//! Panel for displaying project files and repositories.

mod file_controls;
mod file_list;
mod node;
mod projects;
mod repositories;

use crate::app::state::IdeState;

pub fn render_file_tree(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.heading("Projects");
    ui.separator();

    projects::render_projects(ui, state);

    ui.separator();
    ui.heading("Repositories");

    repositories::render_repositories(ui, state);

    ui.separator();
    ui.heading("Files");

    file_controls::render_file_controls(ui, state);
    file_list::render_file_list(ui, state);
}
