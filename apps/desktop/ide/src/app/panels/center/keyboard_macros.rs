use crate::app::state::keyboard_macros::{KeyboardMacrosState, PlaybackSpeed};
use egui::{Context, Ui, ScrollArea, Color32};

pub fn render_keyboard_macros_panel(
    ctx: &Context,
    state: &mut KeyboardMacrosState,
) {
    egui::Window::new("⌨️ Keyboard Macros")
        .collapsible(true)
        .resizable(true)
        .default_width(500.0)
        .show(ctx, |ui| {
            if state.is_recording {
                ui.horizontal(|ui| {
                    ui.colored_label(Color32::RED, "🔴 Recording...");
                    if ui.button("⏹️ Stop Recording").clicked() {
                        state.stop_recording("New Macro".to_string());
                    }
                });

                ui.separator();

                ui.label(format!("Actions recorded: {}", state.recording_actions.len()));
            } else {
                ui.horizontal(|ui| {
                    if ui.button("⏺️ Start Recording").clicked() {
                        state.start_recording();
                    }
                });

                ui.separator();

                ui.heading("Saved Macros");
                ScrollArea::vertical()
                    .max_height(300.0)
                    .show(ui, |ui| {
                        for (i, macro_) in state.macros.iter().enumerate() {
                            ui.group(|ui| {
                                ui.horizontal(|ui| {
                                    ui.label(&macro_.name);
                                    ui.label(format!("{} actions", macro_.actions.len()));
                                    ui.label(&macro_.created_at[..19]);
                                });

                                ui.horizontal(|ui| {
                                    if ui.button("▶️ Play").clicked() {
                                        state.play_macro(i);
                                    }
                                    if ui.button("🗑️ Delete").clicked() {
                                        state.delete_macro(i);
                                    }
                                });
                            });
                        }
                    });

                if state.macros.is_empty() {
                    ui.label("No macros recorded. Start recording to create a macro.");
                }
            }

            ui.separator();

            ui.horizontal(|ui| {
                ui.label("Playback Speed:");
                ui.radio_value(&mut state.playback_speed, PlaybackSpeed::Normal, "Normal");
                ui.radio_value(&mut state.playback_speed, PlaybackSpeed::Slow, "Slow");
                ui.radio_value(&mut state.playback_speed, PlaybackSpeed::Fast, "Fast");
                ui.radio_value(&mut state.playback_speed, PlaybackSpeed::Instant, "Instant");
            });
        });
}
