//! Real-time Collaboration
//!
//! Feature 5: Multi-user collaboration on automation sessions

use std::collections::HashMap;
use std::sync::Arc;
use serde::{Deserialize, Serialize};
use tokio::sync::{broadcast, RwLock};
use crate::error::{Error, Result};
use crate::types::{Action, Command, SessionId};

/// Collaborator information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Collaborator {
    pub id: String,
    pub name: String,
    pub role: CollaboratorRole,
    pub joined_at: chrono::DateTime<chrono::Utc>,
    pub last_active: chrono::DateTime<chrono::Utc>,
}

/// Collaborator role
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum CollaboratorRole {
    Owner,
    Editor,
    Viewer,
}

/// Collaboration event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CollabEvent {
    UserJoined { user: Collaborator },
    UserLeft { user_id: String },
    ActionExecuted { user_id: String, action: Action },
    SessionStateChanged { state: String },
    ChatMessage { user_id: String, message: String },
}

/// Collaboration session
pub struct CollabSession {
    pub session_id: SessionId,
    pub owner_id: String,
    pub collaborators: Arc<RwLock<HashMap<String, Collaborator>>>,
    pub event_tx: broadcast::Sender<CollabEvent>,
}

impl CollabSession {
    /// Create new collaboration session
    pub fn new(session_id: SessionId, owner_id: String) -> Self {
        let (event_tx, _) = broadcast::channel(100);
        Self {
            session_id,
            owner_id,
            collaborators: Arc::new(RwLock::new(HashMap::new())),
            event_tx,
        }
    }

    /// Join session
    pub async fn join(&self, user: Collaborator) -> Result<()> {
        let mut collaborators = self.collaborators.write().await;
        collaborators.insert(user.id.clone(), user.clone());
        
        let _ = self.event_tx.send(CollabEvent::UserJoined { user });
        Ok(())
    }

    /// Leave session
    pub async fn leave(&self, user_id: &str) -> Result<()> {
        let mut collaborators = self.collaborators.write().await;
        collaborators.remove(user_id);
        
        let _ = self.event_tx.send(CollabEvent::UserLeft { user_id: user_id.to_string() });
        Ok(())
    }

    /// Subscribe to events
    pub fn subscribe(&self) -> broadcast::Receiver<CollabEvent> {
        self.event_tx.subscribe()
    }

    /// Send chat message
    pub async fn send_message(&self, user_id: &str, message: &str) -> Result<()> {
        let _ = self.event_tx.send(CollabEvent::ChatMessage {
            user_id: user_id.to_string(),
            message: message.to_string(),
        });
        Ok(())
    }

    /// Get collaborator count
    pub async fn collaborator_count(&self) -> usize {
        self.collaborators.read().await.len()
    }
}

/// Collaboration manager
pub struct CollabManager {
    sessions: Arc<RwLock<HashMap<String, Arc<CollabSession>>>>,
}

impl CollabManager {
    /// Create new collaboration manager
    pub fn new() -> Self {
        Self {
            sessions: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Create a new session
    pub async fn create_session(&self, session_id: SessionId, owner_id: String) -> Result<Arc<CollabSession>> {
        let session = Arc::new(CollabSession::new(session_id, owner_id));
        let mut sessions = self.sessions.write().await;
        sessions.insert(session.session_id.to_string(), session.clone());
        Ok(session)
    }

    /// Get session by ID
    pub async fn get_session(&self, session_id: &str) -> Option<Arc<CollabSession>> {
        let sessions = self.sessions.read().await;
        sessions.get(session_id).cloned()
    }

    /// Close session
    pub async fn close_session(&self, session_id: &str) -> Result<()> {
        let mut sessions = self.sessions.write().await;
        sessions.remove(session_id);
        Ok(())
    }

    /// List active sessions
    pub async fn list_sessions(&self) -> Vec<String> {
        let sessions = self.sessions.read().await;
        sessions.keys().cloned().collect()
    }
}

impl Default for CollabManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_collab_session() {
        let session = CollabSession::new(
            SessionId::default(),
            "owner".to_string(),
        );
        
        let user = Collaborator {
            id: "user1".to_string(),
            name: "Test User".to_string(),
            role: CollaboratorRole::Editor,
            joined_at: chrono::Utc::now(),
            last_active: chrono::Utc::now(),
        };
        
        session.join(user).await.unwrap();
        assert_eq!(session.collaborator_count().await, 1);
    }

    #[tokio::test]
    async fn test_collab_manager() {
        let manager = CollabManager::new();
        let session = manager.create_session(
            SessionId::default(),
            "owner".to_string(),
        ).await.unwrap();
        
        assert!(manager.get_session(&session.session_id.to_string()).await.is_some());
    }
}
