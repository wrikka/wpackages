use anyhow::{Context, Result};
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use simple_peer::{Peer, PeerOptions};
use std::collections::HashMap;
use std::sync::Arc;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionInfo {
    pub id: Uuid,
    pub name: String,
    pub host: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub participants: Vec<Participant>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Participant {
    pub id: Uuid,
    pub name: String,
    pub color: String,
    pub cursor_position: Option<(usize, usize)>,
    pub is_host: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TerminalState {
    pub content: String,
    pub cursor_position: (usize, usize),
    pub scroll_position: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CollaborationMessage {
    Join { participant: Participant },
    Leave { participant_id: Uuid },
    TerminalState { state: TerminalState },
    CursorMove { participant_id: Uuid, position: (usize, usize) },
    TextChange { participant_id: Uuid, change: String },
    VoiceChat { participant_id: Uuid, audio_data: Vec<u8> },
    ChatMessage { participant_id: Uuid, message: String },
}

pub struct SessionManager {
    sessions: Arc<RwLock<HashMap<Uuid, SessionInfo>>>,
    active_session: Arc<RwLock<Option<Uuid>>>,
    peers: Arc<RwLock<HashMap<Uuid, Peer>>>,
    signaling_server: Arc<RwLock<Option<String>>>,
}

impl SessionManager {
    pub fn new(signaling_server: Option<String>) -> Self {
        Self {
            sessions: Arc::new(RwLock::new(HashMap::new())),
            active_session: Arc::new(RwLock::new(None)),
            peers: Arc::new(RwLock::new(HashMap::new())),
            signaling_server: Arc::new(RwLock::new(signaling_server)),
        }
    }

    pub async fn create_session(&self, name: String) -> Result<SessionInfo> {
        let session_id = Uuid::new_v4();
        let host = Participant {
            id: Uuid::new_v4(),
            name: "Host".to_string(),
            color: "#FF5733".to_string(),
            cursor_position: None,
            is_host: true,
        };

        let session = SessionInfo {
            id: session_id,
            name,
            host: "localhost".to_string(),
            created_at: chrono::Utc::now(),
            participants: vec![host.clone()],
        };

        self.sessions.write().insert(session_id, session.clone());
        *self.active_session.write() = Some(session_id);

        Ok(session)
    }

    pub async fn join_session(&self, session_id: Uuid, name: String) -> Result<SessionInfo> {
        let mut sessions = self.sessions.write();
        let session = sessions.get_mut(&session_id)
            .ok_or_else(|| anyhow::anyhow!("Session not found"))?;

        let participant = Participant {
            id: Uuid::new_v4(),
            name: name.clone(),
            color: self.generate_color(),
            cursor_position: None,
            is_host: false,
        };

        session.participants.push(participant.clone());

        Ok(session.clone())
    }

    pub async fn leave_session(&self, session_id: Uuid, participant_id: Uuid) -> Result<()> {
        let mut sessions = self.sessions.write();
        if let Some(session) = sessions.get_mut(&session_id) {
            session.participants.retain(|p| p.id != participant_id);
        }
        Ok(())
    }

    pub async fn broadcast_state(&self, session_id: Uuid, state: TerminalState) -> Result<()> {
        let message = CollaborationMessage::TerminalState { state };

        if let Some(session) = self.sessions.read().get(&session_id) {
            for participant in &session.participants {
                if let Some(peer) = self.peers.read().get(&participant.id) {
                    self.send_to_peer(peer, &message).await?;
                }
            }
        }

        Ok(())
    }

    pub async fn update_cursor(&self, participant_id: Uuid, position: (usize, usize)) -> Result<()> {
        let message = CollaborationMessage::CursorMove {
            participant_id,
            position,
        };

        if let Some(session_id) = *self.active_session.read() {
            if let Some(session) = self.sessions.read().get(&session_id) {
                for participant in &session.participants {
                    if participant.id != participant_id {
                        if let Some(peer) = self.peers.read().get(&participant.id) {
                            self.send_to_peer(peer, &message).await?;
                        }
                    }
                }
            }
        }

        Ok(())
    }

    pub async fn send_chat_message(&self, participant_id: Uuid, message: String) -> Result<()> {
        let msg = CollaborationMessage::ChatMessage {
            participant_id,
            message,
        };

        if let Some(session_id) = *self.active_session.read() {
            if let Some(session) = self.sessions.read().get(&session_id) {
                for participant in &session.participants {
                    if let Some(peer) = self.peers.read().get(&participant.id) {
                        self.send_to_peer(peer, &msg).await?;
                    }
                }
            }
        }

        Ok(())
    }

    pub async fn start_voice_chat(&self, participant_id: Uuid) -> Result<()> {
        let options = PeerOptions {
            initiator: false,
            ..Default::default()
        };

        let peer = Peer::new(options);
        self.peers.write().insert(participant_id, peer);

        Ok(())
    }

    pub async fn stop_voice_chat(&self, participant_id: Uuid) -> Result<()> {
        self.peers.write().remove(&participant_id);
        Ok(())
    }

    pub async fn send_audio_data(&self, participant_id: Uuid, audio_data: Vec<u8>) -> Result<()> {
        let message = CollaborationMessage::VoiceChat {
            participant_id,
            audio_data,
        };

        if let Some(peer) = self.peers.read().get(&participant_id) {
            self.send_to_peer(peer, &message).await?;
        }

        Ok(())
    }

    pub fn get_active_session(&self) -> Option<SessionInfo> {
        let session_id = *self.active_session.read()?;
        self.sessions.read().get(&session_id).cloned()
    }

    pub fn get_participants(&self, session_id: Uuid) -> Vec<Participant> {
        self.sessions
            .read()
            .get(&session_id)
            .map(|s| s.participants.clone())
            .unwrap_or_default()
    }

    async fn send_to_peer(&self, peer: &Peer, message: &CollaborationMessage) -> Result<()> {
        let data = bincode::serialize(message)?;
        peer.send(&data).await?;
        Ok(())
    }

    fn generate_color(&self) -> String {
        let colors = [
            "#FF5733", "#33FF57", "#3357FF", "#FF33F6",
            "#33FFF6", "#F6FF33", "#FF8C33", "#8C33FF",
        ];
        colors[fastrand::usize(..colors.len())].to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_session_manager() {
        let manager = SessionManager::new(None);

        let session = manager.create_session("Test Session".to_string()).await.unwrap();
        assert_eq!(session.participants.len(), 1);

        let joined = manager.join_session(session.id, "User".to_string()).await.unwrap();
        assert_eq!(joined.participants.len(), 2);
    }
}
