use crate::error::{AppError, AppResult};
use crate::types::config::PtyConfig;
use dashmap::DashMap;
use serde::Serialize;
use tauri::{AppHandle, Emitter, Runtime};
use tokio::sync::{mpsc, Mutex};
use tokio::time::{sleep, Duration};

#[derive(Clone)]
pub struct PtyInstance {
    session: wpty::PtySession,
    rx: std::sync::Arc<Mutex<mpsc::Receiver<Vec<u8>>>>,
}

#[derive(Default)]
pub struct PtyService {
    sessions: DashMap<String, PtyInstance>,
}

#[derive(Clone, Serialize)]
struct PtyDataPayload {
    tab_id: String,
    data: String,
}

impl PtyService {
    pub fn new() -> Self {
        Default::default()
    }

    pub async fn create_pty_session<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        tab_id: String,
        config: PtyConfig,
    ) -> AppResult<()> {
        let cfg = wpty::PtyConfig {
            rows: config.rows,
            cols: config.cols,
            shell: config.shell,
            shell_args: config.shell_args,
            working_dir: None,
            env: None,
            initial_command: None,
        };

        let (tx, rx) = mpsc::channel::<Vec<u8>>(256);
        let rx = std::sync::Arc::new(Mutex::new(rx));

        let session = wpty::PtySession::spawn(&cfg, tx, |_title| {})
            .await
            .map_err(|e| AppError::Pty(format!("Failed to spawn PTY: {e}")))?;

        self.sessions.insert(
            tab_id.clone(),
            PtyInstance {
                session: session.clone(),
                rx: std::sync::Arc::clone(&rx),
            },
        );

        self.spawn_pty_reader_task(app_handle, tab_id.clone());

        Ok(())
    }

    pub async fn write_to_pty(&self, tab_id: String, data: String) -> AppResult<()> {
        let session = self
            .sessions
            .get(&tab_id)
            .map(|pty_instance| pty_instance.session.clone());
        if let Some(session) = session {
            session
                .write(data.as_bytes())
                .await
                .map_err(|e| AppError::Pty(format!("Failed to write to PTY: {e}")))?;
        }
        Ok(())
    }

    pub async fn resize_pty(&self, tab_id: String, rows: u16, cols: u16) -> AppResult<()> {
        let session = self
            .sessions
            .get(&tab_id)
            .map(|pty_instance| pty_instance.session.clone());
        if let Some(session) = session {
            session
                .resize(rows, cols)
                .await
                .map_err(|e| AppError::Pty(format!("Failed to resize PTY: {e}")))?;
        }
        Ok(())
    }

    pub fn close_pty_session(&self, tab_id: String) -> AppResult<()> {
        self.sessions.remove(&tab_id);
        Ok(())
    }

    fn spawn_pty_reader_task<R: Runtime>(&self, app_handle: AppHandle<R>, tab_id: String) {
        if let Some(pty_instance) = self.sessions.get(&tab_id) {
            let rx = std::sync::Arc::clone(&pty_instance.rx);
            let sessions_clone = self.sessions.clone();

            tokio::spawn(async move {
                loop {
                    if !sessions_clone.contains_key(&tab_id) {
                        break; // Exit if session is closed
                    }

                    let mut buf = Vec::new();
                    {
                        let mut guard = rx.lock().await;
                        while let Ok(chunk) = guard.try_recv() {
                            buf.extend_from_slice(&chunk);
                        }
                    }

                    if !buf.is_empty() {
                        let data = String::from_utf8_lossy(&buf).to_string();
                        let _ = app_handle.emit(
                            "pty-data",
                            PtyDataPayload {
                                tab_id: tab_id.clone(),
                                data,
                            },
                        );
                    } else {
                        sleep(Duration::from_millis(10)).await;
                    }
                }
            });
        }
    }
}
