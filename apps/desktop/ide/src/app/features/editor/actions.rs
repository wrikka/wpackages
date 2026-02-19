use crate::app::state::{CenterTab, IdeState, OpenFileTab};
use crate::types::ui::ModalKind;
use filesystem::file_name_from_path;

pub fn set_center_tab(state: &mut IdeState, tab: CenterTab) {
    state.core.ui.center_tab = tab;
}

pub fn set_active_modal(state: &mut IdeState, kind: ModalKind) {
    state.core.ui.active_modal = Some(kind);
}

pub fn toggle_terminal(state: &mut IdeState) {
    state.core.terminal.show_terminal = !state.core.terminal.show_terminal;
}

pub fn close_file_tab(state: &mut IdeState, idx: usize) {
    if idx >= state.core.editor.open_files.len() {
        return;
    }

    state.core.editor.open_files.remove(idx);

    let new_active = match state.core.editor.active_file {
        None => None,
        Some(active) if state.core.editor.open_files.is_empty() => None,
        Some(active) if active == idx => {
            if idx >= state.core.editor.open_files.len() {
                Some(state.core.editor.open_files.len().saturating_sub(1))
            } else {
                Some(idx)
            }
        }
        Some(active) if active > idx => Some(active - 1),
        Some(active) => Some(active),
    };

    state.core.editor.active_file = new_active;
    if state.core.editor.active_file.is_none() {
        state.core.fs.selected_file = None;
        state.core.editor.selected_text.clear();
    }
}

pub fn open_file(state: &mut IdeState, path: &str) {
    state.clear_error();

    state.core.fs.selected_file = Some(crate::types::paths::AbsPath::from(path));
    let existing = state
        .core
        .editor
        .open_files
        .iter()
        .position(|t| t.path.to_string() == path);
    if let Some(idx) = existing {
        state.core.editor.active_file = Some(idx);
        state.core.ui.center_tab = CenterTab::Editor;

        if state.core.settings.config.editor.git_blame
            && state.core.git.blame_cache_path.as_deref() != Some(path)
        {
            if let Some(tab) = state.core.editor.open_files.get(idx) {
                let p = tab.path.clone();
                let t = tab.text.clone();
                update_blame_cache(state, &p, &t);
            }
        }
        return;
    }

    match std::fs::read_to_string(path) {
        Ok(text) => {
                        state.core.editor.selected_text = text.to_string();
            state.core.editor.open_files.push(OpenFileTab {
                path: crate::types::paths::AbsPath::from(path),
                name: file_name_from_path(path),
                text: text.to_string(),
                dirty: false,
            });
            state.core.editor.active_file = Some(state.core.editor.open_files.len().saturating_sub(1));
            state.core.editor.editor_dirty = false;
            state.core.ui.center_tab = CenterTab::Editor;

            if state.core.settings.config.editor.git_blame {
                if let Some(tab) = state.core.editor.open_files.last() {
                    let p = tab.path.clone();
                    let t = tab.text.clone();
                    update_blame_cache(state, &p, &t);
                }
            }
        }
        Err(e) => {
            state.core.editor.selected_text.clear();
            state.core.editor.editor_dirty = false;
            state.set_error(e);
        }
    }
}

fn update_blame_cache(state: &mut IdeState, path: &crate::types::paths::AbsPath, text: &str) {
    let Some(repo_root) = state.core.workspace.selected_repo.clone() else {
        state.core.git.blame_cache_path = Some(path.to_string());
        state.core.git.blame_cache.clear();
        return;
    };

    let max_lines = 100;
    match git::blame_lines(repo_root.as_path(), path.as_path(), max_lines) {
        Ok(lines) => {
            state.core.git.blame_cache_path = Some(path.to_string());
            state.core.git.blame_cache = lines;
        }
        Err(e) => {
            state.core.git.blame_cache_path = Some(path.to_string());
            state.core.git.blame_cache.clear();
            state.set_error(e);
        }
    }
}
