use crate::app::state::remote_container::{RemoteContainerState, ContainerStatus};
use egui::{Context, Ui, ScrollArea, Color32};

pub fn render_remote_container_panel(
    ctx: &Context,
    state: &mut RemoteContainerState,
) {
    egui::Window::new("🐳 Remote Container")
        .collapsible(true)
        .resizable(true)
        .default_width(600.0)
        .show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.checkbox(&mut state.auto_start_enabled, "Auto-start");
            });

            ui.separator();

            ui.horizontal(|ui| {
                if ui.button("➕ Add Container").clicked() {
                    // TODO: Add container config
                }
                if ui.button("🔄 Refresh").clicked() {
                    // TODO: Refresh containers
                }
            });

            ui.separator();

            ui.heading("Container Instances");
            ScrollArea::vertical()
                .max_height(300.0)
                .show(ui, |ui| {
                    for instance in &state.instances {
                        render_container_instance(ui, instance, state);
                    }
                });

            if state.instances.is_empty() {
                ui.label("No containers. Add a container configuration to get started.");
            }

            ui.separator();

            ui.heading("Container Configurations");
            ScrollArea::vertical()
                .max_height(200.0)
                .show(ui, |ui| {
                    for (i, config) in state.configs.iter().enumerate() {
                        ui.group(|ui| {
                            ui.horizontal(|ui| {
                                ui.label(&config.name);
                                ui.label(&config.image);
                            });

                            ui.horizontal(|ui| {
                                if ui.button("▶️ Start").clicked() {
                                    state.start_container(config.clone());
                                }
                                if ui.button("🗑️ Remove").clicked() {
                                    state.remove_config(i);
                                }
                            });
                        });
                    }
                });
        });
}

fn render_container_instance(
    ui: &mut Ui,
    instance: &crate::app::state::remote_container::ContainerInstance,
    state: &RemoteContainerState,
) {
    ui.group(|ui| {
        ui.horizontal(|ui| {
            let status_icon = match instance.status {
                ContainerStatus::Stopped => "⏹️",
                ContainerStatus::Running => "▶️",
                ContainerStatus::Starting => "⏳",
                ContainerStatus::Error => "❌",
            };

            ui.label(status_icon);
            ui.label(&instance.name);

            let status_color = match instance.status {
                ContainerStatus::Stopped => Color32::LIGHT_GRAY,
                ContainerStatus::Running => Color32::LIGHT_GREEN,
                ContainerStatus::Starting => Color32::YELLOW,
                ContainerStatus::Error => Color32::RED,
            };

            let status_text = match instance.status {
                ContainerStatus::Stopped => "Stopped",
                ContainerStatus::Running => "Running",
                ContainerStatus::Starting => "Starting...",
                ContainerStatus::Error => "Error",
            };

            ui.colored_label(status_color, status_text);
        });

        ui.horizontal(|ui| {
            if instance.status == ContainerStatus::Running {
                if ui.button("⏹️ Stop").clicked() {
                    state.stop_container(&instance.id);
                }
            } else {
                if ui.button("▶️ Start").clicked() {
                    // TODO: Start container
                }
            }

            if ui.button("🗑️ Remove").clicked() {
                state.remove_container(&instance.id);
            }

            if ui.button("🔗 Connect").clicked() {
                state.set_active(instance.id.clone());
            }
        });
    });
}
