use crate::app::state::{IdeState, TerminalEvent};
use crate::types::terminal::TerminalShell;
use std::sync::{mpsc, Arc};
use wpty::app::pty_app::PtyApp;

mod pty_integration;
mod tab_management;

pub use tab_management::{close_terminal_tab, ensure_active_tab, handle_terminal_events, new_terminal_tab, send_to_active_terminal, set_active_terminal_tab};
