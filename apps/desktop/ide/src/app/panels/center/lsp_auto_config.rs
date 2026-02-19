use crate::app::state::lsp_auto_config::{LspAutoConfigState, LspServerConfig, InstallationStatus};
use egui::{Context, Ui, ScrollArea, Color32};

pub fn render_lsp_auto_config_panel(
    ctx: &Context,
    state: &mut LspAutoConfigState,
) {
    egui::Window::new("⚙️ LSP Auto-Config")
        .collapsible(true)
        .resizable(true)
        .default_width(500.0)
        .show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.label("Auto-detect:");
                ui.checkbox(&mut state.auto_detect_enabled, "Enabled");
                ui.label("Auto-install:");
                ui.checkbox(&mut state.auto_install_enabled, "Enabled");
            });

            ui.separator();

            if ui.button("🔍 Detect Language Servers").clicked() {
                // TODO: Trigger detection
            }

            ui.separator();

            ui.heading("Detected LSP Servers");
            ScrollArea::vertical()
                .max_height(400.0)
                .show(ui, |ui| {
                    for config in &state.detected_configs {
                        render_lsp_config(ui, config, state);
                    }
                });

            if state.detected_configs.is_empty() {
                ui.label("No language servers detected. Open a project to detect LSPs.");
            }
        });
}

fn render_lsp_config(ui: &mut Ui, config: &LspServerConfig, state: &LspAutoConfigState) {
    ui.group(|ui| {
        ui.horizontal(|ui| {
            ui.label(&config.name);
            ui.label(format!("({})", config.languages.join(", ")));

            if let Some(status) = state.installation_status.get(&config.id) {
                match status {
                    InstallationStatus::NotInstalled => {
                        if config.auto_install {
                            if ui.button("📥 Install").clicked() {
                                // TODO: Install LSP
                            }
                        }
                    }
                    InstallationStatus::Installed => {
                        ui.colored_label(Color32::LIGHT_GREEN, "✓ Installed");
                    }
                    InstallationStatus::Installing => {
                        ui.colored_label(Color32::YELLOW, "⏳ Installing...");
                    }
                    InstallationStatus::Failed(err) => {
                        ui.colored_label(Color32::RED, format!("✗ Failed: {}", err));
                    }
                }
            }
        });

        ui.label(format!("Command: {}", config.command));
        ui.label(format!("Args: {}", config.args.join(" ")));

        if let Some(version) = &config.version {
            ui.label(format!("Version: {}", version));
        }
    });
}
