//! Core state for essential IDE functionality

use super::*;

/// Core state containing essential IDE components
#[derive(Debug)]
pub struct CoreState {
    pub workspace: WorkspaceState,
    pub git: GitState,
    pub fs: FsState,
    pub editor: EditorState,
    pub chat: ChatState,
    pub terminal: TerminalState,
    pub pty: wpty::app::pty_app::PtyApp,
    pub extensions: ExtensionsState,
    pub settings: SettingsState,
    pub github: GitHubState,
    pub ui: UiState,
}

impl Default for CoreState {
    fn default() -> Self {
        Self {
            workspace: WorkspaceState::default(),
            git: GitState::default(),
            fs: FsState::default(),
            editor: EditorState::default(),
            chat: ChatState::default(),
            terminal: TerminalState::default(),
            pty: wpty::app::pty_app::PtyApp::default(),
            extensions: ExtensionsState::default(),
            settings: SettingsState::default(),
            github: GitHubState::default(),
            ui: UiState::default(),
        }
    }
}
