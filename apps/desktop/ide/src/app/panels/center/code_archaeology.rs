use crate::app::state::code_archaeology::{CodeArchaeologyState, ChangeType};
use egui::{Context, Ui, ScrollArea, Color32};

pub fn render_code_archaeology_panel(
    ctx: &Context,
    state: &mut CodeArchaeologyState,
) {
    egui::Window::new("⏳ Code Archaeology")
        .collapsible(true)
        .resizable(true)
        .default_width(700.0)
        .show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.checkbox(&mut state.show_timeline, "Timeline");
                ui.checkbox(&mut state.show_snapshots, "Snapshots");
            });

            ui.separator();

            if let Some(file_path) = &state.selected_file {
                ui.label(format!("File: {}", file_path));

                ui.separator();

                if state.show_timeline {
                    ui.heading("Timeline");
                    ScrollArea::vertical()
                        .max_height(200.0)
                        .show(ui, |ui| {
                            for event in &state.timeline_events {
                                render_timeline_event(ui, event);
                            }
                        });
                }

                ui.separator();

                if state.show_snapshots {
                    ui.horizontal(|ui| {
                        ui.label("Position:");
                        ui.add(egui::Slider::new(&mut state.current_position, 0..=state.snapshots.len().saturating_sub(1)));

                        if let Some(snapshot) = state.get_current_snapshot() {
                            ui.label(format!("Commit: {}", snapshot.commit_hash[..7]));
                        }
                    });

                    ui.separator();

                    ui.heading("Code Snapshot");
                    ScrollArea::vertical()
                        .max_height(300.0)
                        .show(ui, |ui| {
                            if let Some(snapshot) = state.get_current_snapshot() {
                                ui.code(&snapshot.content);
                            }
                        });
                }
            } else {
                ui.label("Select a file to view its code archaeology.");
            }
        });
}

fn render_timeline_event(ui: &mut Ui, event: &crate::app::state::code_archaeology::CodeTimelineEvent) {
    let icon = match event.change_type {
        ChangeType::Added => "➕",
        ChangeType::Modified => "✏️",
        ChangeType::Deleted => "🗑️",
        ChangeType::Moved => "📦",
    };

    ui.group(|ui| {
        ui.horizontal(|ui| {
            ui.label(icon);
            ui.label(&event.commit_hash[..7]);
            ui.label(&event.timestamp[..19]);
            ui.label(&event.author);
        });

        ui.label(&event.message);
        ui.label(format!("{}: {}:{}-{}", event.file_path, event.line_range.0, event.line_range.1));
    });
}
