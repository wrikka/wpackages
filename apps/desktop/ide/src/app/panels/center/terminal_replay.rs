use crate::app::state::terminal_replay::{TerminalReplayState, OutputStream};
use egui::{Context, Ui, ScrollArea, Color32};

pub fn render_terminal_replay_panel(
    ctx: &Context,
    state: &mut TerminalReplayState,
) {
    egui::Window::new("📼 Terminal Replay")
        .collapsible(true)
        .resizable(true)
        .default_width(700.0)
        .show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.label("Auto-record:");
                ui.checkbox(&mut state.auto_record, "Enabled");
            });

            ui.separator();

            if state.is_replaying {
                ui.horizontal(|ui| {
                    ui.label("⏸️ Replaying...");
                    if ui.button("⏹️ Stop").clicked() {
                        state.stop_replay();
                    }
                });

                ui.separator();

                ui.heading("Replay Output");
                render_replay_output(ui, state);
            } else {
                ui.horizontal(|ui| {
                    if ui.button("⏺️ Record New Session").clicked() {
                        // TODO: Start recording
                    }

                    if ui.button("▶️ Replay Selected").clicked() {
                        if let Some(session_id) = state.current_session_id {
                            state.start_replay(session_id);
                        }
                    }
                });

                ui.separator();

                ui.heading("Saved Sessions");
                ScrollArea::vertical()
                    .max_height(300.0)
                    .show(ui, |ui| {
                        for session in &state.sessions {
                            ui.group(|ui| {
                                ui.horizontal(|ui| {
                                    ui.label(&session.name);
                                    ui.label(format!("{} commands", session.commands.len()));
                                    ui.label(&session.created_at[..19]);
                                });

                                ui.horizontal(|ui| {
                                    if ui.button("▶️ Replay").clicked() {
                                        state.start_replay(session.id);
                                    }
                                    if ui.button("🗑️ Delete").clicked() {
                                        state.delete_session(session.id);
                                    }
                                });
                            });
                        }
                    });

                if state.sessions.is_empty() {
                    ui.label("No saved sessions. Record a terminal session to replay it later.");
                }
            }
        });
}

fn render_replay_output(ui: &mut Ui, state: &TerminalReplayState) {
    ScrollArea::vertical()
        .max_height(400.0)
        .show(ui, |ui| {
            if let Some(session) = state.current_session_id.and_then(|id| {
                state.sessions.iter().find(|s| s.id == id)
            }) {
                for (i, (cmd, output)) in session.commands.iter().zip(session.outputs.iter()).enumerate() {
                    ui.group(|ui| {
                        ui.colored_label(Color32::LIGHT_GREEN, format!("$ {}", cmd.command));

                        for out in output {
                            let color = match out.stream {
                                OutputStream::Stdout => Color32::WHITE,
                                OutputStream::Stderr => Color32::LIGHT_RED,
                            };
                            ui.colored_label(color, &out.content);
                        }
                    });
                }
            }
        });
}
