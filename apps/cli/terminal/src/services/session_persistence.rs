use crate::error::{AppError, AppResult};
use crate::types::{Session, SessionId};
use dashmap::DashMap;
use serde::Serialize;
use std::path::PathBuf;
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Runtime};
use tokio::sync::RwLock;

use super::session_events::SessionEvent;

pub struct SessionPersistence {
    sessions: Arc<DashMap<SessionId, Session>>,
    sessions_dir: Arc<RwLock<PathBuf>>,
}

impl SessionPersistence {
    pub fn new(
        sessions: Arc<DashMap<SessionId, Session>>,
        sessions_dir: Arc<RwLock<PathBuf>>,
    ) -> Self {
        Self {
            sessions,
            sessions_dir,
        }
    }

    pub async fn save_session<R: Runtime>(
        &self,
        app_handle: &AppHandle<R>,
        session_id: SessionId,
    ) -> AppResult<()> {
        let session = self
            .sessions
            .get(&session_id)
            .ok_or_else(|| AppError::Other(format!("Session not found: {:?}", session_id)))?;

        let mut sessions_dir = self.sessions_dir.write().await;
        if !sessions_dir.exists() {
            std::fs::create_dir_all(&*sessions_dir)?;
        }

        let session_path = sessions_dir.join(format!("{}.json", session_id.as_str()));
        let content = serde_json::to_string_pretty(&*session)
            .map_err(|e| AppError::Other(format!("Failed to serialize session: {}", e)))?;

        std::fs::write(&session_path, content)?;

        self.emit_event(
            app_handle,
            SessionEvent {
                event_type: SessionEventType::Saved,
                session_id: Some(session_id),
                session: Some(session.clone()),
            },
        )?;

        Ok(())
    }

    pub async fn load_session<R: Runtime>(
        &self,
        app_handle: &AppHandle<R>,
        session_id: SessionId,
    ) -> AppResult<Session> {
        let sessions_dir = self.sessions_dir.read().await;
        let session_path = sessions_dir.join(format!("{}.json", session_id.as_str()));

        let content = std::fs::read_to_string(&session_path)
            .map_err(|e| AppError::Other(format!("Failed to read session file: {}", e)))?;

        let session: Session = serde_json::from_str(&content)
            .map_err(|e| AppError::Other(format!("Failed to deserialize session: {}", e)))?;

        self.sessions.insert(session_id.clone(), session.clone());

        self.emit_event(
            app_handle,
            SessionEvent {
                event_type: SessionEventType::Restored,
                session_id: Some(session_id),
                session: Some(session),
            },
        )?;

        Ok(session)
    }

    pub async fn restore_last_session<R: Runtime>(
        &self,
        app_handle: &AppHandle<R>,
    ) -> AppResult<Option<Session>> {
        let sessions_dir = self.sessions_dir.read().await;

        if !sessions_dir.exists() {
            return Ok(None);
        }

        let mut most_recent: Option<(PathBuf, chrono::DateTime<chrono::Utc>)> = None;

        for entry in std::fs::read_dir(&*sessions_dir)? {
            let entry = entry?;
            let path = entry.path();

            if path.extension().and_then(|s| s.to_str()) == Some("json") {
                if let Ok(metadata) = entry.metadata() {
                    if let Ok(modified) = metadata.modified() {
                        let modified_time = chrono::DateTime::<chrono::Utc>::from(modified);
                        match most_recent {
                            None => most_recent = Some((path, modified_time)),
                            Some((_, prev_time)) if modified_time > prev_time => {
                                most_recent = Some((path, modified_time));
                            }
                            _ => {}
                        }
                    }
                }
            }
        }

        if let Some((path, _)) = most_recent {
            let content = std::fs::read_to_string(&path)?;
            let session: Session = serde_json::from_str(&content)?;
            let session_id = session.id.clone();

            self.sessions.insert(session_id.clone(), session.clone());

            self.emit_event(
                app_handle,
                SessionEvent {
                    event_type: SessionEventType::Restored,
                    session_id: Some(session_id),
                    session: Some(session),
                },
            )?;

            Ok(Some(session))
        } else {
            Ok(None)
        }
    }

    pub async fn delete_all_sessions(&self) -> AppResult<()> {
        let sessions_dir = self.sessions_dir.read().await;

        if !sessions_dir.exists() {
            return Ok(());
        }

        for entry in std::fs::read_dir(&*sessions_dir)? {
            let entry = entry?;
            let path = entry.path();

            if path.is_file() {
                std::fs::remove_file(&path)?;
            }
        }

        self.sessions.clear();

        Ok(())
    }

    fn emit_event<R: Runtime>(
        &self,
        app_handle: &AppHandle<R>,
        event: SessionEvent,
    ) -> AppResult<()> {
        app_handle
            .emit("session-event", event)
            .map_err(|e| AppError::Other(format!("Failed to emit session event: {}", e)))?;
        Ok(())
    }
}
