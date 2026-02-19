use crate::app::{actions, state::IdeState};

pub fn render(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.horizontal(|ui| {
        ui.spacing_mut().item_spacing.x = 10.0;

        render_git_info(ui, state);
        ui.separator();
        render_editor_info(ui, state);

        ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
            render_actions(ui, state);
        });
    });
}

fn render_git_info(ui: &mut egui::Ui, state: &IdeState) {
    let branch = state
        .git
        .branches
        .iter()
        .find(|b| b.is_head)
        .map(|b| b.name.clone())
        .unwrap_or_else(|| "-".to_string());

    let (latest_commit, latest_commit_summary) = state
        .git
        .commits
        .first()
        .map(|c| {
            (
                c.id[..std::cmp::min(7, c.id.len())].to_string(),
                c.summary.clone(),
            )
        })
        .unwrap_or_else(|| ("-".to_string(), "-".to_string()));

    let repo_name = state
        .workspace
        .selected_repo
        .as_ref()
        .map(filesystem::file_name_from_path)
        .unwrap_or_else(|| "-".to_string());

    ui.monospace(repo_name);
    ui.monospace(format!(" {branch}"));
    ui.monospace(latest_commit);
    ui.label(latest_commit_summary);
}

fn render_editor_info(ui: &mut egui::Ui, state: &IdeState) {
    let (file_type, line_count, dirty) = state
        .editor
        .active_file
        .and_then(|i| state.editor.open_files.get(i))
        .map(|t| {
            let ext = <filesystem::AbsPath as AsRef<std::path::Path>>::as_ref(&t.path)
                .extension()
                .and_then(|s| s.to_str())
                .unwrap_or("")
                .to_string();

            let lines = t.text.lines().count();
            (
                if ext.is_empty() {
                    "text".to_string()
                } else {
                    ext
                },
                lines,
                t.dirty,
            )
        })
        .unwrap_or_else(|| ("-".to_string(), 0, false));

    ui.label(file_type);
    if line_count > 0 {
        ui.label(format!("Ln {line_count}"));
    }
    if dirty {
        ui.colored_label(egui::Color32::from_rgb(255, 210, 120), "modified");
    }
}

fn render_actions(ui: &mut egui::Ui, state: &mut IdeState) {
    if ui.button(" Terminal").clicked() {
        actions::toggle_terminal(state);
    }

    if state.ui.notifications > 0 {
        if ui
            .button(format!("🔔 {}", state.ui.notifications))
            .clicked()
        {
            state.ui.notifications = 0;
        }
    } else {
        ui.label("🔔");
    }
}
