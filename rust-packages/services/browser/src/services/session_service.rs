use crate::error::Result;
use crate::types::Session;
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::RwLock;

#[async_trait]
pub trait SessionService: Send + Sync {
    async fn create(&self, id: &str) -> Result<Session>;
    async fn get(&self, id: &str) -> Result<Option<Session>>;
    async fn list(&self) -> Result<Vec<Session>>;
    async fn delete(&self, id: &str) -> Result<()>;
    async fn touch(&self, id: &str) -> Result<()>;
    async fn set_metadata(&self, id: &str, key: &str, value: &str) -> Result<()>;
    async fn get_metadata(&self, id: &str, key: &str) -> Result<Option<String>>;
}

pub struct InMemorySessionService {
    sessions: RwLock<HashMap<String, Session>>,
}

impl InMemorySessionService {
    pub fn new() -> Self {
        Self {
            sessions: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemorySessionService {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl SessionService for InMemorySessionService {
    async fn create(&self, id: &str) -> Result<Session> {
        let session = Session::new(id);
        Ok(session)
    }

    async fn get(&self, id: &str) -> Result<Option<Session>> {
        Ok(self.sessions.read().unwrap().get(id).cloned())
    }

    async fn list(&self) -> Result<Vec<Session>> {
        Ok(self.sessions.read().unwrap().values().cloned().collect())
    }

    async fn delete(&self, id: &str) -> Result<()> {
        self.sessions.write().unwrap().remove(id);
        Ok(())
    }

    async fn touch(&self, id: &str) -> Result<()> {
        if let Some(session) = self.sessions.write().unwrap().get_mut(id) {
            session.touch();
        }
        Ok(())
    }

    async fn set_metadata(&self, id: &str, key: &str, value: &str) -> Result<()> {
        if let Some(session) = self.sessions.write().unwrap().get_mut(id) {
            session.metadata.insert(key.to_string(), value.to_string());
        }
        Ok(())
    }

    async fn get_metadata(&self, id: &str, key: &str) -> Result<Option<String>> {
        Ok(self
            .sessions
            .read()
            .unwrap()
            .get(id)
            .and_then(|s| s.metadata.get(key).cloned()))
    }
}
