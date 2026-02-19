use crate::app::state::IdeState;

pub fn render_gutter(ui: &mut egui::Ui, state: &mut IdeState, active: &crate::types::editor::OpenFileTab, active_path: &str) {
    ui.heading("Gutter");
    ui.separator();

    let lines: Vec<&str> = active.text.lines().take(200).collect();
    egui::ScrollArea::vertical()
        .id_salt("gutter")
        .show(ui, |ui| {
            for (i, _line) in lines.iter().enumerate() {
                let ln = i + 1;
                let blame = if state.settings.config.editor.git_blame
                    && state.git.blame_cache_path.as_deref() == Some(active_path)
                {
                    state
                        .git
                        .blame_cache
                        .get(i)
                        .cloned()
                        .unwrap_or(Some("-".to_string()))
                        .unwrap_or_else(|| "-".to_string())
                } else {
                    "".to_string()
                };

                let left = if state.settings.config.editor.line_numbers {
                    format!("{ln:>4}")
                } else {
                    "".to_string()
                };

                let row = if state.settings.config.editor.git_blame {
                    format!("{left}  {blame}")
                } else {
                    left
                };

                ui.monospace(egui::RichText::new(row).weak());
            }
        });
}
