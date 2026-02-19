use crate::app::state::git_bisect::{GitBisectState, BisectStatus, BisectResult};
use egui::{Context, Ui, ScrollArea, Color32};

pub fn render_git_bisect_panel(
    ctx: &Context,
    state: &mut GitBisectState,
) {
    egui::Window::new("🔍 Git Bisect")
        .collapsible(true)
        .resizable(true)
        .default_width(500.0)
        .show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.label("Status:");
                let status_text = match state.status {
                    BisectStatus::Idle => "Idle",
                    BisectStatus::Running => "Running",
                    BisectStatus::Found => "Found!",
                    BisectStatus::Aborted => "Aborted",
                };
                ui.label(status_text);
            });

            ui.separator();

            if !state.is_active {
                ui.heading("Start New Bisect");
                ui.horizontal(|ui| {
                    ui.label("Bad commit:");
                    if let Some(ref end) = state.end_commit {
                        ui.label(end);
                    } else {
                        ui.label("Not set");
                    }
                });
                ui.horizontal(|ui| {
                    ui.label("Good commit:");
                    if let Some(ref start) = state.start_commit {
                        ui.label(start);
                    } else {
                        ui.label("Not set");
                    }
                });

                if ui.button("▶️ Start Bisect").clicked() {
                    // TODO: Start bisect
                }
            } else {
                ui.heading("Bisect in Progress");

                if let Some(ref current) = state.current_commit {
                    ui.horizontal(|ui| {
                        ui.label("Current commit:");
                        ui.label(current);
                    });
                }

                ui.separator();

                ui.horizontal(|ui| {
                    if ui.button("✅ Good").clicked() {
                        // TODO: Mark as good
                    }
                    if ui.button("❌ Bad").clicked() {
                        // TODO: Mark as bad
                    }
                    if ui.button("⏭️ Skip").clicked() {
                        // TODO: Skip
                    }
                });

                ui.separator();

                ui.heading("Bisect Steps");
                ScrollArea::vertical()
                    .max_height(300.0)
                    .show(ui, |ui| {
                        for step in &state.steps {
                            let icon = match step.result {
                                BisectResult::Good => "✅",
                                BisectResult::Bad => "❌",
                                BisectResult::Skip => "⏭️",
                                BisectResult::Pending => "⏳",
                            };

                            ui.horizontal(|ui| {
                                ui.label(icon);
                                ui.label(&step.commit_hash[..7]);
                                ui.label(&step.message);
                            });
                        }
                    });

                ui.separator();

                ui.horizontal(|ui| {
                    if ui.button("🏁 Found").clicked() {
                        state.mark_found();
                    }
                    if ui.button("🛑 Abort").clicked() {
                        state.abort();
                    }
                });
            }

            ui.separator();

            if ui.button("🔄 Reset").clicked() {
                state.reset();
            }
        });
}
