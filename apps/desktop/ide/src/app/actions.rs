#[cfg(any())]
#[path = "features/chat/actions.rs"]
mod chat;
#[path = "features/editor/actions.rs"]
mod editor;
#[path = "features/extensions/actions.rs"]
mod extensions;
#[path = "features/fs_ops/actions.rs"]
mod fs_ops;
#[path = "features/projects/actions.rs"]
mod projects;
#[path = "features/repo/actions.rs"]
mod repo;
#[path = "features/terminal/actions.rs"]
mod terminal;

pub use editor::{close_file_tab, open_file, set_active_modal, set_center_tab, toggle_terminal};
pub use fs_ops::open_context_menu_at;
pub use fs_ops::{
    begin_new_entry, begin_rename, cancel_new_entry, cancel_rename, commit_new_entry, commit_rename,
};
pub use fs_ops::{begin_new_entry_at, close_context_menu, copy_path_to_clipboard, toggle_directory};
pub use projects::{add_project, reload_project_repos, select_project};
pub use repo::reload_repo_data;
pub use terminal::{new_terminal_tab, send_to_active_terminal, set_active_terminal_tab};

use super::state::IdeState;

use crate::types::git::RepoSummary;
use ::extensions::types::{ExtensionCommand, ViewId};

pub fn close_file_tab(state: &mut IdeState, idx: usize) {
    editor::close_file_tab(state, idx)
}

pub fn select_repo(state: &mut IdeState, repo: RepoSummary) {
    state.core.workspace.selected_repo = Some(repo.root.clone());
    state.core.fs.selected_file = Some(repo.root.to_string().into());
    state.core.editor.selected_text.clear();
    state.core.editor.open_files.clear();
    state.core.editor.active_file = None;
    state.core.git.blame_cache_path = None;
    state.core.git.blame_cache.clear();
    reload_repo_data(state);
}

#[allow(dead_code)]
pub fn apply_extension_command(state: &mut IdeState, command: ExtensionCommand) {
    match command {
        ExtensionCommand::OpenView(view) => {
            state.core.ui.active_modal = Some(match view {
                ViewId::Extensions => crate::types::ui::ModalKind::Extensions,
                ViewId::Settings => crate::types::ui::ModalKind::Settings,
                ViewId::GitHub => crate::types::ui::ModalKind::GitHub,
                ViewId::Git => crate::types::ui::ModalKind::Git,
            });
        }
        ExtensionCommand::ToggleTerminal => {
            state.core.terminal.show_terminal = !state.core.terminal.show_terminal;
        }
    }
}
