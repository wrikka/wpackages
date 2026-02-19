use crate::app::state::IdeState;
use filesystem::file_name_from_path;

pub fn handle_global_shortcuts(ctx: &egui::Context, state: &mut IdeState) {
    if ctx.input(|i| i.modifiers.ctrl && i.key_pressed(egui::Key::P)) {
        state.ui.show_command_palette = true;
        state.ui.palette.reset_root();
    }

    if ctx.input(|i| i.key_pressed(egui::Key::F2)) {
        if let Some(p) = state.fs.selected_file.as_ref() {
            let path = p.to_string();
            state.fs.rename_target = Some(path.clone());
            state.fs.rename_buffer = file_name_from_path(&path);
            state.fs.rename_just_opened = true;
        }
    }

    if ctx.input(|i| i.modifiers.ctrl && !i.modifiers.shift && i.key_pressed(egui::Key::N)) {
        crate::app::actions::begin_new_entry(state, false);
    }

    if ctx.input(|i| i.modifiers.ctrl && i.modifiers.shift && i.key_pressed(egui::Key::N)) {
        crate::app::actions::begin_new_entry(state, true);
    }

    if ctx.input(|i| i.key_pressed(egui::Key::Escape)) {
        if state.fs.rename_target.is_some() {
            crate::app::actions::cancel_rename(state);
        }
        if state.fs.new_entry_parent.is_some() {
            crate::app::actions::cancel_new_entry(state);
        }
        if state.fs.context_menu_target.is_some() {
            crate::app::actions::close_context_menu(state);
        }
    }
}
