use crate::error::{AppError, Result};
use crate::services::pty_service::PtyService;
use crate::types::PtyConfig;
use std::collections::HashMap;
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Clone)]
pub struct SessionManager {
    sessions: Arc<Mutex<HashMap<u32, Arc<PtyService>>>>,
    session_configs: Arc<Mutex<HashMap<u32, PtyConfig>>>,
    next_session_id: Arc<AtomicU32>,
}

impl SessionManager {
    pub fn new() -> Self {
        Self {
            sessions: Arc::new(Mutex::new(HashMap::new())),
            session_configs: Arc::new(Mutex::new(HashMap::new())),
            next_session_id: Arc::new(AtomicU32::new(1)),
        }
    }

    pub fn next_id(&self) -> u32 {
        self.next_session_id.fetch_add(1, Ordering::SeqCst)
    }

    pub async fn add(&self, session_id: u32, session: Arc<PtyService>, config: PtyConfig) {
        self.sessions.lock().await.insert(session_id, session);
        self.session_configs.lock().await.insert(session_id, config);
    }

    pub async fn get(&self, session_id: u32) -> Result<Arc<PtyService>> {
        self.sessions
            .lock()
            .await
            .get(&session_id)
            .cloned()
            .ok_or_else(|| AppError::session_not_found(session_id))
    }

    pub async fn remove(&self, session_id: u32) -> Option<Arc<PtyService>> {
        self.sessions.lock().await.remove(&session_id)
    }

    pub async fn take(&self, session_id: u32) -> Result<Arc<PtyService>> {
        self.sessions
            .lock()
            .await
            .remove(&session_id)
            .ok_or_else(|| AppError::session_not_found(session_id))
    }

    pub async fn get_all_configs(&self) -> HashMap<u32, PtyConfig> {
        self.session_configs.lock().await.clone()
    }

    pub async fn restore(&self, configs: HashMap<u32, PtyConfig>, max_session_id: u32) {
        *self.session_configs.lock().await = configs;
        self.next_session_id.store(max_session_id + 1, Ordering::SeqCst);
    }
}

impl Default for SessionManager {
    fn default() -> Self {
        Self::new()
    }
}
