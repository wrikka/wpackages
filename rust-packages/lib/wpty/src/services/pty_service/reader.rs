use crate::services::event_parser::PtyEventParser;
use crate::services::pty_service::PtyEventCallbacks;
use crate::types::{ExitEvent, ShellIntegrationCommand, ShellIntegrationEvent};
use std::io::Read;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Condvar, Mutex as StdMutex};
use tokio::sync::{mpsc, Mutex};
use tracing::{error, info, warn};
use vte::Parser;

pub fn spawn_reader_task(
    mut reader: Box<dyn Read + Send>,
    data_tx: mpsc::Sender<Vec<u8>>,
    pause_gate: Arc<(StdMutex<bool>, Condvar)>,
    is_closed: Arc<AtomicBool>,
    callbacks: PtyEventCallbacks,
    cwd: Arc<Mutex<String>>,
    exit_tx: mpsc::Sender<ExitEvent>,
) {
    tokio::task::spawn_blocking(move || {
        let mut parser = Parser::new();
        let on_shell_event_callback = callbacks.on_shell_event;
        let wrapped_on_shell_event = Box::new(move |event: ShellIntegrationEvent| {
            if let ShellIntegrationCommand::Cwd = &event.command {
                if let Some(new_cwd) = &event.cwd {
                    let cwd_clone = cwd.clone();
                    let new_cwd_clone = new_cwd.clone();
                    tokio::spawn(async move {
                        let mut cwd_lock = cwd_clone.lock().await;
                        *cwd_lock = new_cwd_clone;
                    });
                }
            }
            on_shell_event_callback(event);
        });

        let mut event_parser = PtyEventParser::new(
            callbacks.on_title_change,
            callbacks.on_hyperlink,
            wrapped_on_shell_event,
            callbacks.on_sixel,
        );
        let mut buf = [0u8; 8192];
        loop {
            if is_closed.load(Ordering::Relaxed) {
                break;
            }

            let (lock, cvar) = &*pause_gate;
            let mut paused = lock.lock().expect("pause gate poisoned");
            while *paused {
                paused = cvar.wait(paused).expect("pause gate poisoned");
            }

            match reader.read(&mut buf) {
                Ok(0) => {
                    info!("PTY reader reached EOF");
                    break;
                }
                Ok(n) => {
                    let data = &buf[..n];
                    parser.advance(&mut event_parser, data);
                    match data_tx.try_send(data.to_vec()) {
                        Ok(()) => {}
                        Err(mpsc::error::TrySendError::Full(_)) => {
                            warn!("PTY output dropped due to backpressure");
                        }
                        Err(mpsc::error::TrySendError::Closed(_)) => {
                            break;
                        }
                    }
                }
                Err(e) => {
                    error!("Error reading from pty: {}", e);
                    let _ = exit_tx.blocking_send(ExitEvent {
                        exit_code: -1,
                        signal: None,
                        killed: Some(false),
                        error: Some(e.to_string()),
                    });
                    break;
                }
            }
        }
    });
}
