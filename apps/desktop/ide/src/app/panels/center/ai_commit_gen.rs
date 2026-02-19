use crate::app::state::ai_commit_gen::{AiCommitGenState, CommitType};
use egui::{Context, Ui, ScrollArea, Color32};

pub fn render_ai_commit_gen_panel(
    ctx: &Context,
    state: &mut AiCommitGenState,
) {
    egui::Window::new("✨ AI Commit Generator")
        .collapsible(true)
        .resizable(true)
        .default_width(600.0)
        .show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.checkbox(&mut state.auto_generate, "Auto-generate");
                ui.checkbox(&mut state.follow_conventional_commits, "Conventional Commits");
                ui.checkbox(&mut state.include_emoji, "Include Emoji");
            });

            ui.separator();

            if ui.button("🔄 Generate Suggestions").clicked() {
                // TODO: Generate commit suggestions
            }

            ui.separator();

            ui.heading("Commit Suggestions");
            ScrollArea::vertical()
                .max_height(300.0)
                .show(ui, |ui| {
                    for (i, suggestion) in state.suggestions.iter().enumerate() {
                        let is_selected = state.selected_suggestion == Some(i);
                        let response = ui.group(|ui| {
                            ui.horizontal(|ui| {
                                if is_selected {
                                    ui.radio(true, "");
                                } else {
                                    ui.radio(false, "");
                                }

                                ui.colored_label(Color32::LIGHT_BLUE, format!("{:?}", suggestion.type_));
                                if let Some(scope) = &suggestion.scope {
                                    ui.label(format!("({})", scope));
                                }
                                ui.label(":");
                                ui.label(&suggestion.title);
                            });

                            if !suggestion.body.is_empty() {
                                ui.label(&suggestion.body);
                            }

                            ui.label(format!("Confidence: {:.0}%", suggestion.confidence * 100.0));
                        });

                        if response.clicked() {
                            state.selected_suggestion = Some(i);
                        }
                    }
                });

            if state.suggestions.is_empty() {
                ui.label("No suggestions. Stage changes and generate suggestions.");
            }

            ui.separator();

            if let Some(suggestion) = state.get_selected() {
                ui.heading("Preview");
                ui.code(state.format_commit(suggestion));

                ui.separator();

                ui.horizontal(|ui| {
                    if ui.button("📋 Copy").clicked() {
                        // TODO: Copy to clipboard
                    }
                    if ui.button("✅ Use This").clicked() {
                        // TODO: Use this commit message
                    }
                });
            }
        });
}
