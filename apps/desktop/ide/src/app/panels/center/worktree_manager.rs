use crate::app::state::worktree_manager::{WorktreeManagerState, WorktreeStatus};
use egui::{Context, Ui, ScrollArea, Color32};

pub fn render_worktree_manager_panel(
    ctx: &Context,
    state: &mut WorktreeManagerState,
) {
    egui::Window::new("🌳 Worktree Manager")
        .collapsible(true)
        .resizable(true)
        .default_width(600.0)
        .show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.checkbox(&mut state.show_inactive, "Show Inactive");
                ui.checkbox(&mut state.auto_prune, "Auto-prune");
            });

            ui.separator();

            ui.horizontal(|ui| {
                if ui.button("➕ New Worktree").clicked() {
                    // TODO: Create new worktree
                }
                if ui.button("🔄 Refresh").clicked() {
                    // TODO: Refresh worktrees
                }
            });

            ui.separator();

            ui.heading("Worktrees");
            ScrollArea::vertical()
                .max_height(400.0)
                .show(ui, |ui| {
                    for (i, worktree) in state.worktrees.iter().enumerate() {
                        render_worktree(ui, worktree, i, state);
                    }
                });

            if state.worktrees.is_empty() {
                ui.label("No worktrees. Create a new worktree to start working on multiple branches.");
            }
        });
}

fn render_worktree(
    ui: &mut Ui,
    worktree: &crate::app::state::worktree_manager::WorktreeInfo,
    index: usize,
    state: &WorktreeManagerState,
) {
    ui.group(|ui| {
        ui.horizontal(|ui| {
            if worktree.is_active {
                ui.colored_label(Color32::LIGHT_GREEN, "📍");
            } else {
                ui.label("📄");
            }

            ui.label(&worktree.name);
            ui.label(&worktree.branch);
            ui.label(format!("Base: {}", worktree.base_branch));
        });

        ui.horizontal(|ui| {
            let status_text = match worktree.status {
                WorktreeStatus::Clean => "✓ Clean",
                WorktreeStatus::Modified => "⚠ Modified",
                WorktreeStatus::Conflicted => "⚡ Conflicted",
                WorktreeStatus::OutOfSync => "🔄 Out of Sync",
            };

            let status_color = match worktree.status {
                WorktreeStatus::Clean => Color32::LIGHT_GREEN,
                WorktreeStatus::Modified => Color32::YELLOW,
                WorktreeStatus::Conflicted => Color32::RED,
                WorktreeStatus::OutOfSync => Color32::LIGHT_BLUE,
            };

            ui.colored_label(status_color, status_text);
            ui.label(&worktree.path.display().to_string());
        });

        ui.horizontal(|ui| {
            if ui.button("🚀 Switch").clicked() {
                // TODO: Switch to worktree
            }
            if ui.button("🗑️ Remove").clicked() {
                // TODO: Remove worktree
            }
        });
    });
}
