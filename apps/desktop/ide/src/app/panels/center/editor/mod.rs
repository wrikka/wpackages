use crate::app::actions;
use crate::app::state::IdeState;
use crate::components::ui::{badge, section_header, BadgeKind};

mod gutter;
mod language_detection;

pub use language_detection::detect_language;

pub fn render(ui: &mut egui::Ui, state: &mut IdeState) {
    section_header(ui, "Editor");

    render_file_info(ui, state);
    render_file_tabs(ui, state);
    render_editor_content(ui, state);
}

fn render_file_info(ui: &mut egui::Ui, state: &mut IdeState) {
    if let Some(active) = state
        .editor
        .active_file
        .and_then(|i| state.editor.open_files.get(i))
    {
        ui.horizontal(|ui| {
            ui.label(active.path.to_string());
            if active.dirty {
                badge(ui, "modified", BadgeKind::Warn);
            }
        });
    } else {
        ui.label("Select a file from the tree");
    }
}

fn render_file_tabs(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.horizontal(|ui| {
        let mut close_idx: Option<usize> = None;

        for (idx, t) in state.editor.open_files.iter().enumerate() {
            ui.group(|ui| {
                ui.horizontal(|ui| {
                    let selected = state.editor.active_file == Some(idx);
                    if ui.selectable_label(selected, &t.name).clicked() {
                        state.editor.active_file = Some(idx);
                        state.fs.selected_file = Some(t.path.clone());
                    }

                    if ui.small_button("x").clicked() {
                        close_idx = Some(idx);
                    }
                });
            });
        }

        if let Some(idx) = close_idx {
            actions::close_file_tab(state, idx);
        }
    });
}

fn render_editor_content(ui: &mut egui::Ui, state: &mut IdeState) {
    egui::ScrollArea::vertical()
        .id_salt("editor")
        .show(ui, |ui| {
            let Some(active_idx) = state.editor.active_file else {
                return;
            };

            let Some(active) = state.editor.open_files.get_mut(active_idx) else {
                return;
            };

            let code_min_h = ui.available_height().max(240.0);
            let active_path = active.path.to_string();

            ui.horizontal(|ui| {
                ui.vertical(|ui| {
                    ui.set_min_width(220.0);
                    ui.set_max_width(320.0);

                    if state.settings.config.editor.line_numbers
                        || state.settings.config.editor.git_blame
                    {
                        gutter::render_gutter(ui, state, active, &active_path);
                    }
                });

                ui.separator();

                ui.vertical(|ui| {
                    ui.set_min_height(code_min_h);
                    render_code_editor(ui, state, active, &active_path);
                });
            });
        });
}

fn render_code_editor(ui: &mut egui::Ui, state: &mut IdeState, active: &mut crate::types::editor::OpenFileTab, active_path: &str) {
    let lang = detect_language(active_path);

    let mut layouter = |ui: &egui::Ui, buf: &dyn egui::TextBuffer, wrap_width: f32| {
        if state.settings.config.editor.syntax_highlight {
            let mut job = egui_extras::syntax_highlighting::highlight(
                ui.ctx(),
                ui.style(),
                &egui_extras::syntax_highlighting::CodeTheme::from_style(ui.style()),
                lang,
                buf.as_str(),
            );
            job.wrap.max_width = wrap_width;
            ui.fonts_mut(|f| f.layout_job(job))
        } else {
            let mut job = egui::text::LayoutJob::simple(
                buf.as_str().to_string(),
                egui::FontId::monospace(
                    ui.style().text_styles[&egui::TextStyle::Monospace].size,
                ),
                ui.visuals().text_color(),
                wrap_width,
            );
            job.wrap.max_width = wrap_width;
            ui.fonts_mut(|f| f.layout_job(job))
        }
    };

    let resp = ui.add(
        egui::TextEdit::multiline(&mut active.text)
            .code_editor()
            .desired_width(f32::INFINITY)
            .desired_rows(22)
            .layouter(&mut layouter),
    );
    if resp.changed() {
        active.dirty = true;
        state.editor.editor_dirty = true;
    }
}
