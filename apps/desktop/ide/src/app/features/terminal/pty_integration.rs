use crate::app::state::TerminalEvent;
use std::sync::{mpsc, Arc};
use wpty::app::pty_app::{NativePtyAppCallbacks, PtyApp};
use wpty::types::{ExitEvent, PtyConfig};

pub fn spawn_terminal_session(
    pty_config: PtyConfig,
    pty_app: Arc<PtyApp>,
    tx: mpsc::Sender<TerminalEvent>,
    tab_id: String,
) {
    crate::app::runtime::TOKIO_RUNTIME.spawn(async move {
        let native_callbacks = NativePtyAppCallbacks {
            on_data: Arc::new({
                let tx = tx.clone();
                move |session_id, data| {
                    let _ = tx.send(TerminalEvent::DataReceived { session_id, data });
                }
            }),
            on_exit: Arc::new({
                let tx = tx.clone();
                move |session_id, _event: ExitEvent| {
                    let _ = tx.send(TerminalEvent::SessionExited { session_id });
                }
            }),
            on_title_change: Arc::new(|_, _| {}),
            on_hyperlink: Arc::new(|_, _| {}),
            on_shell_event: Arc::new(|_, _| {}),
            on_sixel: Arc::new(|_, _| {}),
        };

        match pty_app.spawn_native(pty_config, native_callbacks).await {
            Ok(session_id) => {
                let _ = tx.send(TerminalEvent::SessionCreated { tab_id, session_id });
            }
            Err(e) => {
                log::error!("Failed to spawn terminal session: {}", e);
            }
        }
    });
}
