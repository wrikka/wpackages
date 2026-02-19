use crate::{
    adapters::fonts,
    app::{actions, app::IdeApp, persistence, state::IdeState},
    config::app_config,
};

impl IdeApp {
    pub fn new(cc: &eframe::CreationContext<'_>) -> Self {
        fonts::setup_fonts(&cc.egui_ctx);

        let mut state = IdeState::default();

        if let Some(storage) = cc.storage {
            if let Some(json) = persistence::load_app_config_json(storage) {
                if let Ok(cfg) = app_config::parse_json(&json) {
                    state.settings.config = cfg;
                    state.settings.settings_json =
                        app_config::to_pretty_json(&state.settings.config);
                }
            }

            if let Some(root) = persistence::load_last_project_root(storage) {
                if state.settings.config.workspace.restore_last_project && !root.trim().is_empty() {
                    state.workspace.projects.push(root);
                    state.workspace.repos_by_project.push(Vec::new());
                    state.workspace.selected_project = Some(0);
                    actions::reload_project_repos(&mut state);
                }
            }
        }

        Self { state }
    }
}
