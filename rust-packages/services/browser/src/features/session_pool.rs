use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Session {
    pub id: String,
    pub browser_id: String,
    pub created_at: DateTime<Utc>,
    pub last_used: DateTime<Utc>,
    pub metadata: HashMap<String, String>,
    pub is_active: bool,
}

#[derive(Debug, Clone)]
pub struct SessionPool {
    sessions: Arc<RwLock<HashMap<String, Session>>>,
    max_sessions: usize,
    idle_timeout_seconds: u64,
}

impl SessionPool {
    pub fn new(max_sessions: usize, idle_timeout_seconds: u64) -> Self {
        Self {
            sessions: Arc::new(RwLock::new(HashMap::new())),
            max_sessions,
            idle_timeout_seconds,
        }
    }

    pub async fn acquire_session(&self) -> anyhow::Result<Session> {
        let mut sessions = self.sessions.write().await;
        
        for (id, session) in sessions.iter() {
            if session.is_active {
                continue;
            }
            
            let idle_duration = Utc::now().signed_duration_since(session.last_used);
            if idle_duration.num_seconds() > self.idle_timeout_seconds as i64 {
                continue;
            }
            
            let mut acquired = session.clone();
            acquired.is_active = true;
            acquired.last_used = Utc::now();
            sessions.insert(id.clone(), acquired.clone());
            return Ok(acquired);
        }
        
        if sessions.len() >= self.max_sessions {
            return Err(anyhow::anyhow!("Session pool exhausted"));
        }
        
        let new_session = Session {
            id: Uuid::new_v4().to_string(),
            browser_id: Uuid::new_v4().to_string(),
            created_at: Utc::now(),
            last_used: Utc::now(),
            metadata: HashMap::new(),
            is_active: true,
        };
        
        sessions.insert(new_session.id.clone(), new_session.clone());
        Ok(new_session)
    }

    pub async fn release_session(&self, session_id: &str) -> anyhow::Result<()> {
        let mut sessions = self.sessions.write().await;
        
        if let Some(session) = sessions.get_mut(session_id) {
            session.is_active = false;
            session.last_used = Utc::now();
        }
        
        Ok(())
    }

    pub async fn share_session(&self, session_id: &str, agent_id: &str) -> anyhow::Result<SessionShare> {
        let sessions = self.sessions.read().await;
        
        let session = sessions.get(session_id)
            .ok_or_else(|| anyhow::anyhow!("Session not found"))?;
        
        let share = SessionShare {
            session_id: session_id.to_string(),
            agent_id: agent_id.to_string(),
            shared_at: Utc::now(),
            access_token: Uuid::new_v4().to_string(),
            permissions: vec!["read".to_string(), "write".to_string()],
        };
        
        Ok(share)
    }

    pub async fn get_pool_stats(&self) -> PoolStats {
        let sessions = self.sessions.read().await;
        
        let total = sessions.len();
        let active = sessions.values().filter(|s| s.is_active).count();
        let idle = total - active;
        
        PoolStats {
            total_sessions: total,
            active_sessions: active,
            idle_sessions: idle,
            max_sessions: self.max_sessions,
        }
    }

    pub async fn cleanup_idle_sessions(&self) -> usize {
        let mut sessions = self.sessions.write().await;
        let mut removed = 0;
        
        let now = Utc::now();
        let to_remove: Vec<String> = sessions
            .iter()
            .filter(|(_, s)| !s.is_active && 
                now.signed_duration_since(s.last_used).num_seconds() > self.idle_timeout_seconds as i64)
            .map(|(id, _)| id.clone())
            .collect();
        
        for id in to_remove {
            sessions.remove(&id);
            removed += 1;
        }
        
        removed
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionShare {
    pub session_id: String,
    pub agent_id: String,
    pub shared_at: DateTime<Utc>,
    pub access_token: String,
    pub permissions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PoolStats {
    pub total_sessions: usize,
    pub active_sessions: usize,
    pub idle_sessions: usize,
    pub max_sessions: usize,
}
