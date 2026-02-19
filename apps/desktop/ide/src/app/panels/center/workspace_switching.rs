use crate::app::state::workspace_switching::{WorkspaceSwitchingState, WorkspaceSnapshot};
use egui::{Context, Ui, ScrollArea, Layout, Sense, vec2};

pub fn render_workspace_switching_panel(
    ctx: &Context,
    state: &mut WorkspaceSwitchingState,
) {
    egui::Window::new("📁 Workspace Switcher")
        .collapsible(true)
        .resizable(true)
        .default_width(400.0)
        .show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.label("Auto-save:");
                ui.checkbox(&mut state.auto_save_enabled, "Enabled");
                ui.label(format!("Max: {}", state.max_snapshots));
            });

            ui.separator();

            ScrollArea::vertical()
                .max_height(400.0)
                .show(ui, |ui| {
                    for snapshot in &state.snapshots {
                        let is_current = state.current_snapshot_id.as_ref() == Some(&snapshot.id);
                        let response = ui.group(|ui| {
                            ui.horizontal(|ui| {
                                if is_current {
                                    ui.label("📍");
                                } else {
                                    ui.label("📄");
                                }
                                ui.label(&snapshot.name);
                                ui.with_layout(Layout::right_to_left(egui::Align::Center), |ui| {
                                    ui.label(format!("{} files", snapshot.open_files.len()));
                                    ui.label(&snapshot.created_at[..19]);
                                });
                            });
                            ui.label(format!("Path: {}", snapshot.path.display()));
                        });

                        if response.clicked() {
                            state.current_snapshot_id = Some(snapshot.id.clone());
                        }
                    }
                });

            ui.separator();

            ui.horizontal(|ui| {
                if ui.button("💾 Save Current").clicked() {
                    // TODO: Implement save current workspace
                }

                if ui.button("🗑️ Clear All").clicked() {
                    state.snapshots.clear();
                    state.current_snapshot_id = None;
                }
            });
        });
}

pub fn render_workspace_selector(
    ui: &mut Ui,
    state: &mut WorkspaceSwitchingState,
) {
    ui.menu_button("📁 Workspaces", |ui| {
        if state.snapshots.is_empty() {
            ui.label("No saved workspaces");
            return;
        }

        for snapshot in &state.snapshots {
            let is_current = state.current_snapshot_id.as_ref() == Some(&snapshot.id);
            if ui.selectable_label(is_current, &snapshot.name).clicked() {
                state.current_snapshot_id = Some(snapshot.id.clone());
                ui.close_menu();
            }
        }

        ui.separator();
        if ui.button("Manage Workspaces...").clicked() {
            // Open workspace switcher panel
        }
    });
}
