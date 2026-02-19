use crate::app::state::IdeState;
use crate::services::clipboard_service;
use crate::types::{fs::FileNode, paths};
use filesystem::file_name_from_path;
use std::path::Path;

fn default_new_entry_parent(state: &IdeState) -> Option<String> {
    state
        .core
        .workspace
        .selected_repo
        .as_ref()
        .map(|r: &paths::RepoRoot| r.to_string())
}

pub fn begin_new_entry(state: &mut IdeState, is_dir: bool) {
    state.core.fs.new_entry_is_dir = is_dir;
    state.core.fs.new_entry_parent = default_new_entry_parent(state);
    state.core.fs.new_entry_buffer.clear();
    state.core.fs.new_entry_just_opened = true;
}

pub fn begin_new_entry_at(state: &mut IdeState, parent: &str, is_dir: bool) {
    state.core.fs.new_entry_is_dir = is_dir;
    state.core.fs.new_entry_parent = Some(parent.to_string());
    state.core.fs.new_entry_buffer.clear();
    state.core.fs.new_entry_just_opened = true;
}

pub fn commit_new_entry(state: &mut IdeState) {
    state.clear_error();

    let Some(parent) = state.core.fs.new_entry_parent.clone() else {
        return;
    };

    let name = state.core.fs.new_entry_buffer.trim();
    if name.is_empty() {
        return;
    }

    let path = Path::new(&parent).join(name).to_string_lossy().to_string();
    let result = if state.core.fs.new_entry_is_dir {
        std::fs::create_dir_all(&path)
    } else {
        std::fs::File::create(&path).map(|_| ())
    };
    match result {
        Ok(()) => {
            state.core.fs.new_entry_parent = None;
            state.core.fs.new_entry_buffer.clear();
            crate::app::actions::reload_repo_data(state);
        }
        Err(e) => state.set_error(e),
    }
}

pub fn cancel_new_entry(state: &mut IdeState) {
    state.core.fs.new_entry_parent = None;
    state.core.fs.new_entry_buffer.clear();
}

pub fn begin_rename(state: &mut IdeState, path: &str) {
    state.core.fs.rename_target = Some(path.to_string());
    state.core.fs.rename_buffer = file_name_from_path(path);
    state.core.fs.rename_just_opened = true;
}

pub fn commit_rename(state: &mut IdeState) {
    state.clear_error();

    let Some(from) = state.core.fs.rename_target.clone() else {
        return;
    };
    let new_name = state.core.fs.rename_buffer.trim();
    if new_name.is_empty() {
        return;
    }
    let parent = Path::new(&from)
        .parent()
        .map(std::path::PathBuf::from)
        .unwrap_or_else(|| std::path::PathBuf::from("/"));
    let to = parent.join(new_name).to_string_lossy().to_string();
    if to == from {
        state.core.fs.rename_target = None;
        return;
    }

    match std::fs::rename(&from, &to) {
        Ok(()) => {
            for t in &mut state.core.editor.open_files {
                if t.path.to_string() == from {
                    t.path = to.clone().into();
                    t.name = file_name_from_path(&to);
                }
            }
            if state.core.editor.active_file.is_some_and(|i| state.core.editor.open_files[*i].path.to_string() == from) {
                state.core.editor.active_file = state.core.editor.open_files.iter().position(|t| t.path.to_string() == to);
            }
            if state
                .core
                .fs
                .selected_file
                .as_ref()
                .is_some_and(|p: &paths::AbsPath| p.to_string() == from)
            {
                state.core.fs.selected_file = Some(to.into());
            }

            state.core.fs.rename_target = None;
            state.core.fs.rename_buffer.clear();
            crate::app::actions::reload_repo_data(state);
        }
        Err(e) => state.set_error(e),
    }
}

pub fn cancel_rename(state: &mut IdeState) {
    state.core.fs.rename_target = None;
    state.core.fs.rename_buffer.clear();
    state.core.fs.rename_just_opened = false;
}

pub fn open_context_menu_at(
    state: &mut IdeState,
    target_path: &str,
    is_dir: bool,
    pos: Option<egui::Pos2>,
) {
    state.core.fs.context_menu_target = Some(target_path.to_string());
    state.core.fs.context_menu_is_dir = is_dir;
    state.core.fs.context_menu_pos = pos;
}

pub fn close_context_menu(state: &mut IdeState) {
    state.core.fs.context_menu_target = None;
    state.core.fs.context_menu_is_dir = false;
    state.core.fs.context_menu_pos = None;
}

pub fn copy_path_to_clipboard(state: &mut IdeState, path: &str) {
    state.clear_error();
    if let Err(e) = clipboard_service::copy_text(path) {
        state.set_error(e);
    }
}

pub fn toggle_directory(state: &mut IdeState, node: &FileNode) {
    if state.core.fs.expanded_dirs.contains(&node.path) {
        state.core.fs.expanded_dirs.remove(&node.path);
    } else {
        state.core.fs.expanded_dirs.insert(node.path.clone());
    }
}
