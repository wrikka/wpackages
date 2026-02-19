use crate::app::state::{IdeState, TerminalEvent};
use crate::types::terminal::TerminalShell;
use std::sync::{mpsc, Arc};
use wpty::app::pty_app::{NativePtyAppCallbacks, PtyApp};
use wpty::types::{ExitEvent, PtyConfig};

use super::pty_integration;

fn get_cwd(state: &IdeState) -> Option<String> {
    state.core.workspace.selected_repo.as_ref().map(|p| p.to_string())
}

pub fn ensure_active_tab(state: &mut IdeState) -> Option<usize> {
    if state.core.terminal.tabs.is_empty() {
        state.core.terminal.active_tab = None;
        return None;
    }

    match state.core.terminal.active_tab {
        Some(idx) if idx < state.core.terminal.tabs.len() => Some(idx),
        _ => {
            state.core.terminal.active_tab = Some(0);
            Some(0)
        }
    }
}

pub fn new_terminal_tab(
    state: &mut IdeState,
    shell: TerminalShell,
    pty_app: Arc<PtyApp>,
    tx: mpsc::Sender<TerminalEvent>,
) {
    let next = state.core.terminal.tabs.len() + 1;
    let title = format!("{}-{}", shell.label(), next);
    let tab_id = title.clone();
    state
        .core
        .terminal
        .tabs
        .push(crate::types::terminal::TerminalTab::new(
            tab_id.clone(), shell, title,
        ));

    let pty_config = PtyConfig {
        command: shell.label().to_string(),
        args: vec![],
        cwd: get_cwd(state),
        rows: 50,
        cols: 100,
        initial_command: None,
    };

    pty_integration::spawn_terminal_session(pty_config, pty_app, tx, tab_id);
    state.core.terminal.active_tab = Some(state.core.terminal.tabs.len().saturating_sub(1));
}

pub fn set_active_terminal_tab(state: &mut IdeState, idx: usize) {
    if idx < state.core.terminal.tabs.len() {
        state.core.terminal.active_tab = Some(idx);
    }
}

pub fn close_terminal_tab(state: &mut IdeState, idx: usize) {
    if idx >= state.core.terminal.tabs.len() {
        return;
    }
    let tab = state.core.terminal.tabs.remove(idx);

    if let Some(session_id) = tab.session_id {
        let pty = state.core.pty.clone();
        crate::app::runtime::TOKIO_RUNTIME.spawn(async move {
            if let Err(e) = pty.kill(session_id).await {
                log::error!("Failed to kill terminal session {}: {}", session_id, e);
            }
        });
    }

    if state.core.terminal.tabs.is_empty() {
        state.core.terminal.active_tab = None;
        return;
    }

    let new_active = match state.core.terminal.active_tab {
        None => Some(0),
        Some(active) if active == idx => Some(idx.min(state.core.terminal.tabs.len() - 1)),
        Some(active) if active > idx => Some(active - 1),
        Some(active) => Some(active),
    };
    state.core.terminal.active_tab = new_active;
}

pub fn handle_terminal_events(state: &mut IdeState) {
    while let Ok(event) = state.channels.terminal_rx.try_recv() {
        match event {
            TerminalEvent::SessionCreated { tab_id, session_id } => {
                if let Some(tab) = state.core.terminal.tabs.iter_mut().find(|t| t.tab_id == tab_id) {
                    tab.session_id = Some(session_id);
                    tab.connected = true;
                }
            }
            TerminalEvent::DataReceived { session_id, data } => {
                if let Some(tab) = state.core.terminal.tabs.iter_mut().find(|t| t.session_id == Some(session_id)) {
                    let str_data = String::from_utf8_lossy(&data);
                    tab.buffer.push_str(&str_data);
                }
            }
            TerminalEvent::SessionExited { session_id } => {
                if let Some(tab) = state.core.terminal.tabs.iter_mut().find(|t| t.session_id == Some(session_id)) {
                    tab.connected = false;
                    tab.session_id = None;
                    tab.buffer.push_str("\n\n[PROCESS EXITED]");
                }
            }
        }
    }
}

#[cfg(any())]
pub fn clear_active_terminal_buffer(state: &mut IdeState) {
    let Some(idx) = ensure_active_tab(state) else {
        return;
    };
    if let Some(tab) = state.core.terminal.tabs.get_mut(idx) {
        tab.buffer.clear();
    }
}

pub fn send_to_active_terminal(state: &mut IdeState, line: String) {
    let Some(idx) = ensure_active_tab(state) else {
        return;
    };
    let Some(tab) = state.core.terminal.tabs.get_mut(idx) else {
        return;
    };
    tab.input.clear();

    if let Some(session_id) = tab.session_id {
        let pty = state.core.pty.clone();
        let line_clone = line.clone();
        crate::app::runtime::TOKIO_RUNTIME.spawn(async move {
            if let Err(e) = pty.write(session_id, line_clone).await {
                log::error!("Failed to write to terminal: {}", e);
            }
        });
    }
}
