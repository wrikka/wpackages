use crate::error::{AppError, AppResult};
use crate::types::{Session, SessionConfig, SessionHistoryEntry, SessionId};
use dashmap::DashMap;
use std::path::PathBuf;
use std::sync::Arc;
use tauri::{AppHandle, Runtime};
use tokio::sync::RwLock;

use super::session_events::{SessionEvent, SessionEventType};
use super::session_persistence::SessionPersistence;
use super::session_templates::SessionTemplates;

#[derive(Clone)]
pub struct SessionService {
    sessions: Arc<DashMap<SessionId, Session>>,
    active_session_id: Arc<RwLock<Option<SessionId>>>,
    templates: Arc<RwLock<Vec<crate::types::SessionTemplate>>>,
    sessions_dir: Arc<RwLock<PathBuf>>,
    auto_save: Arc<RwLock<bool>>,
    persistence: SessionPersistence,
    templates_service: SessionTemplates,
}

impl Default for SessionService {
    fn default() -> Self {
        Self::new()
    }
}

impl SessionService {
    pub fn new() -> Self {
        let sessions = Arc::new(DashMap::new());
        let templates = Arc::new(RwLock::new(Vec::new()));
        let sessions_dir = Arc::new(RwLock::new(PathBuf::from("sessions")));
        let auto_save = Arc::new(RwLock::new(true));

        let persistence = SessionPersistence::new(sessions.clone(), sessions_dir.clone());
        let templates_service = SessionTemplates::new(sessions.clone(), templates.clone());

        Self {
            sessions,
            active_session_id: Arc::new(RwLock::new(None)),
            templates,
            sessions_dir,
            auto_save,
            persistence,
            templates_service,
        }
    }

    pub async fn create_session<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        name: String,
        config: SessionConfig,
    ) -> AppResult<SessionId> {
        let session = Session::new(name, config);
        let session_id = session.id.clone();

        self.sessions.insert(session_id.clone(), session.clone());

        self.emit_event(
            &app_handle,
            SessionEvent {
                event_type: SessionEventType::Created,
                session_id: Some(session_id.clone()),
                session: Some(session),
            },
        )?;

        Ok(session_id)
    }

    pub async fn update_session<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        session_id: SessionId,
        mut session: Session,
    ) -> AppResult<()> {
        if !self.sessions.contains_key(&session_id) {
            return Err(AppError::Other(format!(
                "Session not found: {:?}",
                session_id
            )));
        }

        session.id = session_id.clone();
        session.updated_at = chrono::Utc::now();
        self.sessions.insert(session_id.clone(), session.clone());

        self.emit_event(
            &app_handle,
            SessionEvent {
                event_type: SessionEventType::Updated,
                session_id: Some(session_id),
                session: Some(session),
            },
        )?;

        Ok(())
    }

    pub async fn delete_session<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        session_id: SessionId,
    ) -> AppResult<()> {
        let session = self.sessions.remove(&session_id);

        if let Some((_, session)) = session {
            let mut active_id = self.active_session_id.write().await;
            if active_id.as_ref() == Some(&session_id) {
                *active_id = None;
            }
            drop(active_id);

            self.emit_event(
                &app_handle,
                SessionEvent {
                    event_type: SessionEventType::Deleted,
                    session_id: Some(session_id),
                    session: Some(session),
                },
            )?;
        }

        Ok(())
    }

    pub async fn activate_session<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        session_id: SessionId,
    ) -> AppResult<()> {
        if !self.sessions.contains_key(&session_id) {
            return Err(AppError::Other(format!(
                "Session not found: {:?}",
                session_id
            )));
        }

        *self.active_session_id.write().await = Some(session_id.clone());

        self.emit_event(
            &app_handle,
            SessionEvent {
                event_type: SessionEventType::Activated,
                session_id: Some(session_id.clone()),
                session: self.sessions.get(&session_id).map(|s| s.clone()),
            },
        )?;

        Ok(())
    }

    pub async fn get_session(&self, session_id: &SessionId) -> Option<Session> {
        self.sessions.get(session_id).map(|s| s.clone())
    }

    pub async fn get_all_sessions(&self) -> Vec<Session> {
        self.sessions.iter().map(|s| s.clone()).collect()
    }

    pub async fn get_active_session(&self) -> Option<Session> {
        let active_id = self.active_session_id.read().await;
        active_id
            .as_ref()
            .and_then(|id| self.sessions.get(id).map(|s| s.clone()))
    }

    pub async fn get_active_session_id(&self) -> Option<SessionId> {
        self.active_session_id.read().await.clone()
    }

    pub async fn save_session<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        session_id: SessionId,
    ) -> AppResult<()> {
        self.persistence.save_session(&app_handle, session_id).await
    }

    pub async fn load_session<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        session_id: SessionId,
    ) -> AppResult<Session> {
        self.persistence.load_session(&app_handle, session_id).await
    }

    pub async fn restore_last_session<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
    ) -> AppResult<Option<Session>> {
        self.persistence.restore_last_session(&app_handle).await
    }

    pub async fn add_command_to_history(&self, session_id: &SessionId, entry: SessionHistoryEntry) {
        if let Some(mut session) = self.sessions.get_mut(session_id) {
            session.config.history.add_entry(entry);
            session.updated_at = chrono::Utc::now();
        }
    }

    pub async fn get_session_history(
        &self,
        session_id: &SessionId,
    ) -> Option<Vec<SessionHistoryEntry>> {
        self.sessions
            .get(session_id)
            .map(|s| s.config.history.entries.clone())
    }

    pub async fn search_session_history(
        &self,
        session_id: &SessionId,
        query: &str,
    ) -> Vec<SessionHistoryEntry> {
        self.sessions
            .get(session_id)
            .map(|s| s.config.history.search(query))
            .unwrap_or_default()
    }

    pub async fn create_template<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        template: crate::types::SessionTemplate,
    ) -> AppResult<String> {
        self.templates_service
            .create_template(&app_handle, template)
            .await
    }

    pub async fn get_templates(&self) -> Vec<crate::types::SessionTemplate> {
        self.templates_service.get_templates().await
    }

    pub async fn get_template(&self, template_id: &str) -> Option<crate::types::SessionTemplate> {
        self.templates_service.get_template(template_id).await
    }

    pub async fn apply_template<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        template_id: &str,
        session_name: String,
    ) -> AppResult<SessionId> {
        self.templates_service
            .apply_template(&app_handle, template_id, session_name)
            .await
    }

    pub async fn set_auto_save(&self, enabled: bool) {
        *self.auto_save.write().await = enabled;
    }

    pub async fn is_auto_save_enabled(&self) -> bool {
        *self.auto_save.read().await
    }

    pub async fn auto_save_active_session<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
    ) -> AppResult<()> {
        if !self.is_auto_save_enabled().await {
            return Ok(());
        }

        if let Some(session_id) = self.get_active_session_id().await {
            self.save_session(app_handle, session_id).await?;
        }

        Ok(())
    }

    pub async fn delete_all_sessions(&self) -> AppResult<()> {
        self.persistence.delete_all_sessions().await?;
        *self.active_session_id.write().await = None;
        Ok(())
    }

    pub async fn search_sessions(&self, query: &str) -> Vec<Session> {
        let query_lower = query.to_lowercase();
        self.sessions
            .iter()
            .filter(|s| {
                s.name.to_lowercase().contains(&query_lower)
                    || s.metadata
                        .values()
                        .any(|v| v.to_lowercase().contains(&query_lower))
            })
            .map(|s| s.clone())
            .collect()
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
