use crate::app::{actions, state::IdeState};
use egui::Pos2;

pub fn render_context_menu(ui: &mut egui::Ui, state: &mut IdeState) {
    let Some(target) = state.fs.context_menu_target.clone() else {
        return;
    };

    let pos = state
        .fs
        .context_menu_pos
        .unwrap_or_else(|| ui.ctx().pointer_latest_pos().unwrap_or(egui::Pos2::ZERO));

    egui::Area::new("fs_context_menu".into())
        .order(egui::Order::Foreground)
        .fixed_pos(pos)
        .show(ui.ctx(), |ui| {
            egui::Frame::popup(ui.style()).show(ui, |ui| {
                render_menu_items(ui, state, &target);
            });
        });

    if ui
        .ctx()
        .input(|i| i.pointer.any_click() && !i.pointer.secondary_clicked())
    {
        actions::close_context_menu(state);
    }
}

fn render_menu_items(ui: &mut egui::Ui, state: &mut IdeState, target: &str) {
    if ui.button("Open").clicked() {
        if !state.fs.context_menu_is_dir {
            actions::open_file(state, target);
        }
        actions::close_context_menu(state);
    }
    if ui.button("Rename").clicked() {
        actions::begin_rename(state, target);
        actions::close_context_menu(state);
    }
    if ui.button("Copy Path").clicked() {
        actions::copy_path_to_clipboard(state, target);
        actions::close_context_menu(state);
    }
    ui.separator();
    if state.fs.context_menu_is_dir {
        if ui.button("New File").clicked() {
            actions::begin_new_entry_at(state, target, false);
            actions::close_context_menu(state);
        }
        if ui.button("New Folder").clicked() {
            actions::begin_new_entry_at(state, target, true);
            actions::close_context_menu(state);
        }
    }
    ui.separator();
    if ui.button("Close").clicked() {
        actions::close_context_menu(state);
    }
}
