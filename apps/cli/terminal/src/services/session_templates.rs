use crate::error::{AppError, AppResult};
use crate::types::{Session, SessionId, SessionTemplate};
use dashmap::DashMap;
use serde::Serialize;
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Runtime};
use tokio::sync::RwLock;

use super::session_events::SessionEvent;

pub struct SessionTemplates {
    sessions: Arc<DashMap<SessionId, Session>>,
    templates: Arc<RwLock<Vec<SessionTemplate>>>,
}

impl SessionTemplates {
    pub fn new(
        sessions: Arc<DashMap<SessionId, Session>>,
        templates: Arc<RwLock<Vec<SessionTemplate>>>,
    ) -> Self {
        Self {
            sessions,
            templates,
        }
    }

    pub async fn create_template<R: Runtime>(
        &self,
        app_handle: &AppHandle<R>,
        template: SessionTemplate,
    ) -> AppResult<String> {
        let template_id = template.id.clone();
        let mut templates = self.templates.write().await;
        templates.push(template);
        drop(templates);

        Ok(template_id)
    }

    pub async fn get_templates(&self) -> Vec<SessionTemplate> {
        self.templates.read().await.clone()
    }

    pub async fn get_template(&self, template_id: &str) -> Option<SessionTemplate> {
        self.templates
            .read()
            .await
            .iter()
            .find(|t| t.id == template_id)
            .cloned()
    }

    pub async fn apply_template<R: Runtime>(
        &self,
        app_handle: &AppHandle<R>,
        template_id: &str,
        session_name: String,
    ) -> AppResult<SessionId> {
        let template = self
            .get_template(template_id)
            .ok_or_else(|| AppError::Other(format!("Template not found: {}", template_id)))?;

        let mut session = template.session.clone();
        session.id = SessionId::new();
        session.name = session_name;
        session.created_at = chrono::Utc::now();
        session.updated_at = chrono::Utc::now();

        let session_id = session.id.clone();
        self.sessions.insert(session_id.clone(), session.clone());

        self.emit_event(
            app_handle,
            SessionEvent {
                event_type: SessionEventType::Created,
                session_id: Some(session_id.clone()),
                session: Some(session),
            },
        )?;

        Ok(session_id)
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
