use crate::app::{actions, state::IdeState};
use std::sync::Arc;

pub fn render(ui: &mut egui::Ui, state: &mut IdeState) {
    
    if let Some(action) = terminal::show(ui, &mut state.terminal) {
        match action {
            terminal::TerminalAction::NewTab(shell) => {
                actions::new_terminal_tab(state, shell, Arc::new(state.pty.clone()), state.terminal_tx.clone());
            }
            terminal::TerminalAction::SetActiveTab(idx) => {
                actions::set_active_terminal_tab(state, idx);
            }
            terminal::TerminalAction::SendInput(line) => {
                actions::send_to_active_terminal(state, line);
            }
        }
    }
}
