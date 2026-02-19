//! Channel state for communication channels

use super::*;

/// Channel state containing communication channels
#[derive(Debug)]
pub struct ChannelState {
    pub job_tx: Option<mpsc::Sender<crate::types::jobs::JobRequest>>,
    pub terminal_tx: mpsc::Sender<TerminalEvent>,
    pub terminal_rx: mpsc::Receiver<TerminalEvent>,
}

impl ChannelState {
    pub fn new() -> (Self, mpsc::Sender<TerminalEvent>, mpsc::Receiver<TerminalEvent>) {
        let (terminal_tx, terminal_rx) = mpsc::channel();
        (
            Self {
                job_tx: None,
                terminal_tx: terminal_tx.clone(),
                terminal_rx,
            },
            terminal_tx,
        )
    }
}

impl Default for ChannelState {
    fn default() -> Self {
        let (tx, rx) = mpsc::channel();
        Self {
            job_tx: None,
            terminal_tx: tx,
            terminal_rx: rx,
        }
    }
}
