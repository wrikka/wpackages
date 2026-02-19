use crate::app::state::semantic_search::{SemanticSearchState, SemanticSearchResult};
use egui::{Context, Ui, ScrollArea, Color32};

pub fn render_semantic_search_panel(
    ctx: &Context,
    state: &mut SemanticSearchState,
) {
    egui::Window::new("🔍 Semantic Search")
        .collapsible(true)
        .resizable(true)
        .default_width(600.0)
        .show(ctx, |ui| {
            let mut query = state.current_query.as_ref().map(|q| q.query.clone()).unwrap_or_default();

            ui.horizontal(|ui| {
                ui.label("Search:");
                ui.text_edit_singleline(&mut query);

                if ui.button("🔎 Search").clicked() {
                    // TODO: Perform semantic search
                }

                if ui.button("🗑️ Clear").clicked() {
                    state.clear_results();
                }
            });

            ui.separator();

            if state.is_searching {
                ui.label("⏳ Searching...");
                return;
            }

            ui.heading("Search Results");
            ScrollArea::vertical()
                .max_height(400.0)
                .show(ui, |ui| {
                    if state.search_results.is_empty() {
                        ui.label("No results found.");
                        return;
                    }

                    for result in &state.search_results {
                        render_search_result(ui, result);
                    }
                });

            ui.separator();

            ui.heading("Search History");
            ScrollArea::vertical()
                .max_height(150.0)
                .show(ui, |ui| {
                    for (i, hist) in state.search_history.iter().enumerate() {
                        ui.label(format!("{}. {}", i + 1, hist.query));
                    }
                });
        });
}

fn render_search_result(ui: &mut Ui, result: &SemanticSearchResult) {
    ui.group(|ui| {
        ui.horizontal(|ui| {
            ui.label(&result.file_path);
            ui.label(format!("Line {}", result.line_number));
            ui.colored_label(Color32::LIGHT_BLUE, format!("Relevance: {:.0}%", result.relevance * 100.0));
        });

        if let Some(func_name) = &result.function_name {
            ui.label(format!("Function: {}", func_name));
        }

        ui.label(&result.description);

        ui.group(|ui| {
            ui.label("Code:");
            ui.code(&result.code_snippet);
        });

        if !result.context.is_empty() {
            ui.group(|ui| {
                ui.label("Context:");
                for ctx in &result.context {
                    ui.label(ctx);
                }
            });
        }
    });
}
