use crate::app::state::IdeState;
use git_search::{GitSearch, QueryBuilder};

pub(crate) fn render(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.heading("Cross-Repo Search");
    ui.separator();

    render_search_input(ui, state);
    ui.separator();

    render_search_options(ui, state);
    ui.separator();

    render_results(ui, state);
}

fn render_search_input(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.horizontal(|ui| {
        ui.label("Search:");
        let response = ui.add(
            egui::TextEdit::singleline(&mut state.git_search.query)
                .hint_text("Search across all repositories...")
                .desired_width(f32::INFINITY),
        );

        if response.lost_focus() && ui.input(|i| i.key_pressed(egui::Key::Enter)) {
            perform_search(state);
        }

        if ui.button("Search").clicked() {
            perform_search(state);
        }

        if state.git_search.searching {
            ui.add(egui::Spinner::new());
        }
    });
}

fn render_search_options(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.horizontal(|ui| {
        ui.checkbox(&mut state.git_search.case_sensitive, "Case Sensitive");
        ui.checkbox(&mut state.git_search.whole_word, "Whole Word");
        ui.checkbox(&mut state.git_search.regex, "Regex");

        ui.separator();

        ui.label("Max Results:");
        ui.add(egui::Slider::new(&mut state.git_search.max_results, 10..=500));

        ui.separator();

        ui.checkbox(&mut state.git_search.show_preview, "Show Preview");
    });
}

fn render_results(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.heading(format!("Results ({})", state.git_search.results.len()));

    if state.git_search.results.is_empty() {
        if !state.git_search.searching && !state.git_search.query.is_empty() {
            ui.label("No results found");
        } else if state.git_search.query.is_empty() {
            ui.label("Enter a search query to begin");
        }
        return;
    }

    egui::ScrollArea::vertical()
        .id_salt("search_results")
        .max_height(500.0)
        .show(ui, |ui| {
            for (idx, result) in state.git_search.results.iter().enumerate() {
                let selected = state.git_search.selected_result == Some(idx);

                ui.group(|ui| {
                    ui.horizontal(|ui| {
                        ui.selectable_label(selected, &result.repo_name);
                        ui.label(format!("Score: {:.2}", result.score));

                        ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                            if let Some(author) = &result.author {
                                ui.label(format!("by {}", author));
                            }
                        });
                    });

                    ui.label(&result.file_path);
                    ui.monospace(format!("Line {}: {}", result.line_number, result.line_content));

                    if state.git_search.show_preview {
                        ui.separator();
                        ui.label("Preview:");
                        render_file_preview(ui, result);
                    }

                    if ui.button("Open File").clicked() {
                        open_file(state, result);
                    }
                });

                ui.add_space(8.0);
            }
        });
}

fn render_file_preview(ui: &mut egui::Ui, result: &git_search::SearchResult) {
    let full_path = format!("{}/{}", result.repo_path, result.file_path);

    match std::fs::read_to_string(&full_path) {
        Ok(content) => {
            let lines: Vec<&str> = content.lines().collect();
            let start = result.line_number.saturating_sub(3);
            let end = (result.line_number + 2).min(lines.len());

            egui::ScrollArea::vertical()
                .max_height(150.0)
                .show(ui, |ui| {
                    for (i, line) in lines.iter().enumerate().take(end).skip(start) {
                        let line_num = i + 1;
                        let is_highlighted = line_num == result.line_number;

                        if is_highlighted {
                            ui.colored_label(
                                egui::Color32::from_rgb(255, 255, 200),
                                format!("{}: {}", line_num, line),
                            );
                        } else {
                            ui.monospace(format!("{}: {}", line_num, line));
                        }
                    }
                });
        }
        Err(_) => {
            ui.colored_label(egui::Color32::RED, "Failed to read file");
        }
    }
}

fn perform_search(state: &mut IdeState) {
    if state.git_search.query.is_empty() {
        return;
    }

    state.git_search.searching = true;
    state.git_search.results.clear();
    state.git_search.selected_result = None;

    let query = QueryBuilder::new(&state.git_search.query)
        .case_sensitive(state.git_search.case_sensitive)
        .whole_word(state.git_search.whole_word)
        .regex(state.git_search.regex)
        .max_results(state.git_search.max_results)
        .build();

    let repos: Vec<String> = state
        .workspace
        .repos_by_project
        .iter()
        .flat_map(|repos| repos.iter().map(|r| r.root.clone()))
        .collect();

    let search = GitSearch::new(repos);

    tokio::spawn(async move {
        match search.search(&query).await {
            Ok(results) => {
                // TODO: Implement results update via channel or async mechanism
                // - Send search results to state
                // - Update UI to display results
                // For now, this is a placeholder that would be replaced with actual state update
            }
            Err(e) => {
                eprintln!("Search error: {}", e);
            }
        }
    });
}

fn open_file(state: &mut IdeState, result: &git_search::SearchResult) {
    let full_path = format!("{}/{}", result.repo_path, result.file_path);
    crate::app::actions::open_file(state, &full_path);
}
