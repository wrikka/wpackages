use super::state::settings::SettingsMode;
use super::state::IdeState;
use crate::components;
use crate::config::app_config::AppConfig;

pub fn validate_settings_json(state: &mut IdeState) {
    match components::settings::validate_json(&state.settings.settings_json) {
        Ok(_) => state.settings.settings_json_error = None,
        Err(e) => state.settings.settings_json_error = Some(e),
    }
}

pub fn apply_settings(state: &mut IdeState) {
    match state.settings.settings_mode {
        SettingsMode::Ui => {
            state.settings.settings_json =
                components::settings::config_to_json(&state.settings.config);
            state.settings.settings_json_error = None;
        }
        SettingsMode::Json => {
            match components::settings::validate_json(&state.settings.settings_json) {
                Ok(cfg) => {
                    state.settings.config = cfg;
                    state.settings.settings_json =
                        components::settings::config_to_json(&state.settings.config);
                    state.settings.settings_json_error = None;
                }
                Err(e) => state.settings.settings_json_error = Some(e),
            }
        }
    }
}

pub fn sync_json_from_ui(state: &mut IdeState) {
    state.settings.settings_json = components::settings::config_to_json(&state.settings.config);
    state.settings.settings_json_error = None;
}

pub fn reset_settings(state: &mut IdeState) {
    state.settings.config = AppConfig::default();
    state.settings.settings_json = components::settings::config_to_json(&state.settings.config);
    state.settings.settings_json_error = None;
}
