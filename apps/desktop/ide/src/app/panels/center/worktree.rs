use crate::app::state::IdeState;
use git::ops::worktree::{get_worktrees, create_worktree, remove_worktree, prune_worktrees};

pub(crate) fn render(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.heading("Git Worktrees");
    ui.separator();

    ui.horizontal(|ui| {
        if ui.button("Refresh").clicked() {
            refresh_worktrees(state);
        }

        if ui.button("New Worktree").clicked() {
            state.worktree.creating = true;
        }

        ui.checkbox(&mut state.worktree.show_prunable, "Show Prunable");

        if state.worktree.creating {
            render_create_worktree_dialog(ui, state);
        }
    });

    ui.separator();

    if state.worktree.worktrees.is_empty() {
        ui.label("No worktrees found");
        return;
    }

    egui::ScrollArea::vertical()
        .id_salt("worktrees")
        .max_height(500.0)
        .show(ui, |ui| {
            for worktree in &state.worktree.worktrees {
                render_worktree(ui, state, worktree);
                ui.add_space(8.0);
            }
        });
}

fn render_worktree(ui: &mut egui::Ui, state: &mut IdeState, worktree: &git::types::WorktreeEntry) {
    let selected = state.worktree.selected_worktree.as_ref() == Some(&worktree.path);

    ui.group(|ui| {
        ui.horizontal(|ui| {
            ui.selectable_label(selected, &worktree.branch);
            
            ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                if worktree.is_prunable {
                    ui.colored_label(egui::Color32::from_rgb(251, 191, 36), "PRUNABLE");
                }
                if worktree.is_detached {
                    ui.colored_label(egui::Color32::GRAY, "DETACHED");
                }
            });
        });

        ui.label(format!("Path: {}", worktree.path));
        ui.label(format!("Commit: {}", &worktree.commit_id[..7.min(worktree.commit_id.len())]));

        ui.horizontal(|ui| {
            if ui.button("Open").clicked() {
                if let Err(e) = open::that(&worktree.path) {
                    state.set_error(format!("Failed to open worktree: {}", e));
                }
            }

            if ui.button("Switch").clicked() {
                state.workspace.selected_repo = Some(worktree.path.clone());
                refresh_worktrees(state);
            }

            if worktree.is_prunable {
                if ui.button("Prune").clicked() {
                    prune_worktree(state, &worktree.path);
                }
            }

            if ui.button("Remove").clicked() {
                remove_worktree(state, &worktree.path);
            }
        });
    });
}

fn render_create_worktree_dialog(ui: &mut egui::Ui, state: &mut IdeState) {
    egui::Window::new("Create New Worktree")
        .collapsible(false)
        .resizable(false)
        .show(ui.ctx(), |ui| {
            ui.label("Branch:");
            ui.add(
                egui::TextEdit::singleline(&mut state.worktree.new_worktree_branch)
                    .hint_text("Branch name")
                    .desired_width(300.0),
            );

            ui.label("Worktree Name:");
            ui.add(
                egui::TextEdit::singleline(&mut state.worktree.new_worktree_name)
                    .hint_text("Worktree directory name")
                    .desired_width(300.0),
            );

            ui.separator();

            ui.horizontal(|ui| {
                if ui.button("Create").clicked() {
                    create_new_worktree(state);
                }

                if ui.button("Cancel").clicked() {
                    state.worktree.creating = false;
                    state.worktree.new_worktree_name.clear();
                    state.worktree.new_worktree_branch.clear();
                }
            });
        });
}

fn refresh_worktrees(state: &mut IdeState) {
    if let Some(repo_root) = &state.workspace.selected_repo {
        match get_worktrees(repo_root) {
            Ok(worktrees) => {
                state.worktree.worktrees = worktrees;
            }
            Err(e) => {
                state.set_error(format!("Failed to get worktrees: {}", e));
            }
        }
    }
}

fn create_new_worktree(state: &mut IdeState) {
    if let Some(repo_root) = &state.workspace.selected_repo {
        if state.worktree.new_worktree_branch.is_empty() || state.worktree.new_worktree_name.is_empty() {
            state.set_error("Branch and worktree name are required");
            return;
        }

        let worktree_path = format!("{}/{}", repo_root, state.worktree.new_worktree_name);
        let branch = state.worktree.new_worktree_branch.clone();
        let repo_path = repo_root.clone();

        tokio::spawn(async move {
            match create_worktree(&repo_path, &branch, &worktree_path) {
                Ok(_) => {
                    // TODO: Implement refresh mechanism via channel or async mechanism
                    // - Send refresh signal to update worktree list
                    // - Update UI to show new worktree
                    // For now, this is a placeholder
                }
                Err(e) => {
                    eprintln!("Failed to create worktree: {}", e);
                }
            }
        });

        state.worktree.creating = false;
        state.worktree.new_worktree_name.clear();
        state.worktree.new_worktree_branch.clear();
    }
}

fn prune_worktree(state: &mut IdeState, path: &str) {
    if let Some(repo_root) = &state.workspace.selected_repo {
        match prune_worktrees(repo_root) {
            Ok(_) => {
                refresh_worktrees(state);
            }
            Err(e) => {
                state.set_error(format!("Failed to prune worktree: {}", e));
            }
        }
    }
}

fn remove_worktree(state: &mut IdeState, path: &str) {
    if let Some(repo_root) = &state.workspace.selected_repo {
        match remove_worktree(repo_root, path) {
            Ok(_) => {
                refresh_worktrees(state);
            }
            Err(e) => {
                state.set_error(format!("Failed to remove worktree: {}", e));
            }
        }
    }
}
