use crate::app::state::smart_snippets::{SmartSnippetsState, SnippetSuggestion};
use egui::{Context, Ui, ScrollArea, Color32};

pub fn render_smart_snippets_panel(
    ctx: &Context,
    state: &mut SmartSnippetsState,
) {
    egui::Window::new("💡 Smart Snippets")
        .collapsible(true)
        .resizable(true)
        .default_width(500.0)
        .show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.checkbox(&mut state.auto_expand, "Auto-expand");
                ui.checkbox(&mut state.show_preview, "Show Preview");
            });

            ui.separator();

            ui.heading("Snippet Suggestions");
            ScrollArea::vertical()
                .max_height(300.0)
                .show(ui, |ui| {
                    for suggestion in &state.suggestions {
                        render_snippet_suggestion(ui, suggestion);
                    }
                });

            if state.suggestions.is_empty() {
                ui.label("No suggestions. Type a snippet prefix to see suggestions.");
            }

            ui.separator();

            ui.heading("Available Snippets");
            ScrollArea::vertical()
                .max_height(200.0)
                .show(ui, |ui| {
                    for snippet in &state.snippets {
                        ui.group(|ui| {
                            ui.horizontal(|ui| {
                                ui.label(&snippet.name);
                                ui.label(format!("{} lines", snippet.body.len()));
                            });

                            ui.label(&snippet.description);
                            ui.label(format!("Prefix: {}", snippet.prefix));
                        });
                    }
                });
        });
}

fn render_snippet_suggestion(ui: &mut Ui, suggestion: &SnippetSuggestion) {
    ui.group(|ui| {
        ui.horizontal(|ui| {
            ui.label(&suggestion.name);
            ui.colored_label(Color32::LIGHT_BLUE, format!("Relevance: {:.0}%", suggestion.relevance * 100.0));
        });

        if state.show_preview {
            ui.group(|ui| {
                ui.label("Preview:");
                ui.code(&suggestion.preview);
            });
        }
    });
}
