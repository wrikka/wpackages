use crate::app::state::{
    settings::{SettingsMode, SettingsPage},
    IdeState,
};
use crate::app::settings;

pub(crate) fn render(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.heading("Settings");
    ui.separator();

    ui.horizontal(|ui| {
        ui.selectable_value(&mut state.settings.settings_mode, SettingsMode::Ui, "UI");
        ui.selectable_value(
            &mut state.settings.settings_mode,
            SettingsMode::Json,
            "JSON",
        );

        ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
            if ui.button("Apply").clicked() {
                settings::apply_settings(state);
            }
        });
    });

    if let Some(err) = &state.settings.settings_json_error {
        ui.colored_label(egui::Color32::from_rgb(255, 120, 120), err);
    }

    ui.columns(2, |cols| {
        cols[0].set_min_width(220.0);
        cols[0].heading("Categories");
        cols[0].separator();

        for (page, label) in SettingsPage::all() {
            cols[0].selectable_value(&mut state.settings.settings_page, page, label);
        }

        cols[1].heading(state.settings.settings_page.label());
        cols[1].separator();

        match state.settings.settings_mode {
            SettingsMode::Ui => {
                match state.settings.settings_page {
                    SettingsPage::General => {
                        setting_row(&mut cols[1], "Use system dialogs", |ui| {
                            ui.checkbox(&mut state.settings.config.workspace.use_system_dialogs, "");
                        });
                        setting_row(&mut cols[1], "Restore last project", |ui| {
                            ui.checkbox(&mut state.settings.config.workspace.restore_last_project, "");
                        });
                    }
                    SettingsPage::Appearance => {
                        setting_row(&mut cols[1], "Dark theme", |ui| {
                            ui.checkbox(&mut state.settings.config.ui.theme_dark, "");
                        });
                        setting_row(&mut cols[1], "Font size", |ui| {
                            ui.add(egui::Slider::new(&mut state.settings.config.ui.font_size, 10.0..=22.0));
                        });
                    }
                    SettingsPage::Editor => {
                        setting_row(&mut cols[1], "Syntax highlight", |ui| {
                            ui.checkbox(&mut state.settings.config.editor.syntax_highlight, "");
                        });
                        setting_row(&mut cols[1], "Line numbers", |ui| {
                            ui.checkbox(&mut state.settings.config.editor.line_numbers, "");
                        });
                        setting_row(&mut cols[1], "Git blame", |ui| {
                            ui.checkbox(&mut state.settings.config.editor.git_blame, "");
                        });
                    }
                    SettingsPage::Extensions => {
                        cols[1].label("Extensions settings (mock)\nPlanned: extension contributions + marketplace.");
                    }
                    SettingsPage::AI => {
                        cols[1].label("AI settings (mock)");
                    }
                    SettingsPage::Network => {
                        cols[1].label("Network settings (mock)");
                    }
                }

                if cols[1].button("Sync JSON from UI").clicked() {
                    settings::sync_json_from_ui(state);
                }
            }
            SettingsMode::Json => {
                cols[1].label("Edit settings as JSON (VScode-like)");
                let resp = cols[1].add(
                    egui::TextEdit::multiline(&mut state.settings.settings_json)
                        .code_editor()
                        .desired_width(f32::INFINITY)
                        .desired_rows(22),
                );

                if resp.changed() {
                    state.settings.settings_json_error = None;
                }

                cols[1].horizontal(|ui| {
                    if ui.button("Validate").clicked() {
                        settings::validate_settings_json(state);
                    }
                    if ui.button("Apply JSON").clicked() {
                        settings::apply_settings(state);
                    }
                    if ui.button("Reset").clicked() {
                        settings::reset_settings(state);
                    }
                });
            }
        }
    });
}

fn setting_row(ui: &mut egui::Ui, label: &str, control: impl FnOnce(&mut egui::Ui)) {
    ui.group(|ui| {
        ui.horizontal(|ui| {
            ui.label(label);
            ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                control(ui);
            });
        });
    });
    ui.add_space(6.0);
}
    });
    ui.add_space(6.0);
}
