use crate::app::state::IdeState;
use filesystem::file_name_from_path;

pub fn begin_new_entry(state: &mut IdeState, is_dir: bool) {
    state.fs.new_entry_parent = state.workspace.selected_repo.clone().map(|p| p.to_string());
    state.fs.new_entry_is_dir = is_dir;
    state.fs.new_entry_buffer.clear();
}

pub fn begin_new_entry_at(state: &mut IdeState, parent: &str, is_dir: bool) {
    state.fs.new_entry_parent = Some(parent.to_string());
    state.fs.new_entry_is_dir = is_dir;
    state.fs.new_entry_buffer.clear();
}

pub fn cancel_new_entry(state: &mut IdeState) {
    state.fs.new_entry_parent = None;
    state.fs.new_entry_buffer.clear();
}

pub fn begin_rename(state: &mut IdeState, path: &str) {
    state.fs.rename_target = Some(path.to_string());
    state.fs.rename_buffer = file_name_from_path(path);
}

pub fn cancel_rename(state: &mut IdeState) {
    state.fs.rename_target = None;
    state.fs.rename_buffer.clear();
}
