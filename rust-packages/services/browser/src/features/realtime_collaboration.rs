use std::collections::HashMap;
use tokio::sync::{broadcast, RwLock};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CollaborationSession {
    pub session_id: String,
    pub browser_session_id: String,
    pub created_at: DateTime<Utc>,
    pub participants: Vec<Participant>,
    pub actions: Vec<CollaborativeAction>,
    pub shared_state: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Participant {
    pub id: String,
    pub name: String,
    pub role: ParticipantRole,
    pub joined_at: DateTime<Utc>,
    pub cursor_position: Option<CursorPosition>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ParticipantRole {
    Controller,
    Observer,
    Contributor,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CursorPosition {
    pub x: f64,
    pub y: f64,
    pub element_ref: Option<String>,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CollaborativeAction {
    pub id: String,
    pub participant_id: String,
    pub action_type: CollaborativeActionType,
    pub timestamp: DateTime<Utc>,
    pub data: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CollaborativeActionType {
    Click,
    Type,
    Navigate,
    Scroll,
    Highlight,
    Comment,
    TakeControl,
    ReleaseControl,
}

#[derive(Debug, Clone)]
pub struct RealtimeCollaboration {
    sessions: RwLock<HashMap<String, CollaborationSession>>,
    event_sender: broadcast::Sender<CollaborationEvent>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CollaborationEvent {
    ParticipantJoined(Participant),
    ParticipantLeft(String),
    ActionPerformed(CollaborativeAction),
    CursorMoved(String, CursorPosition),
    ControlTransferred { from: String, to: String },
    StateUpdated(HashMap<String, String>),
}

impl RealtimeCollaboration {
    pub fn new() -> Self {
        let (sender, _) = broadcast::channel(100);
        Self {
            sessions: RwLock::new(HashMap::new()),
            event_sender: sender,
        }
    }

    pub async fn create_session(&self, browser_session_id: &str) -> CollaborationSession {
        let session = CollaborationSession {
            session_id: Uuid::new_v4().to_string(),
            browser_session_id: browser_session_id.to_string(),
            created_at: Utc::now(),
            participants: Vec::new(),
            actions: Vec::new(),
            shared_state: HashMap::new(),
        };

        let mut sessions = self.sessions.write().await;
        sessions.insert(session.session_id.clone(), session.clone());

        session
    }

    pub async fn join_session(
        &self,
        session_id: &str,
        name: &str,
        role: ParticipantRole,
    ) -> anyhow::Result<Participant> {
        let mut sessions = self.sessions.write().await;
        let session = sessions.get_mut(session_id)
            .ok_or_else(|| anyhow::anyhow!("Session not found"))?;

        let participant = Participant {
            id: Uuid::new_v4().to_string(),
            name: name.to_string(),
            role,
            joined_at: Utc::now(),
            cursor_position: None,
        };

        session.participants.push(participant.clone());

        let _ = self.event_sender.send(CollaborationEvent::ParticipantJoined(participant.clone()));

        Ok(participant)
    }

    pub async fn leave_session(&self, session_id: &str, participant_id: &str) -> anyhow::Result<()> {
        let mut sessions = self.sessions.write().await;
        let session = sessions.get_mut(session_id)
            .ok_or_else(|| anyhow::anyhow!("Session not found"))?;

        session.participants.retain(|p| p.id != participant_id);

        let _ = self.event_sender.send(CollaborationEvent::ParticipantLeft(participant_id.to_string()));

        Ok(())
    }

    pub async fn perform_action(
        &self,
        session_id: &str,
        participant_id: &str,
        action_type: CollaborativeActionType,
        data: HashMap<String, String>,
    ) -> anyhow::Result<()> {
        let mut sessions = self.sessions.write().await;
        let session = sessions.get_mut(session_id)
            .ok_or_else(|| anyhow::anyhow!("Session not found"))?;

        let participant = session.participants.iter()
            .find(|p| p.id == participant_id)
            .ok_or_else(|| anyhow::anyhow!("Participant not found"))?;

        match participant.role {
            ParticipantRole::Controller | ParticipantRole::Contributor => {}
            _ => return Err(anyhow::anyhow!("Participant does not have permission to perform actions")),
        }

        let action = CollaborativeAction {
            id: Uuid::new_v4().to_string(),
            participant_id: participant_id.to_string(),
            action_type,
            timestamp: Utc::now(),
            data,
        };

        session.actions.push(action.clone());

        let _ = self.event_sender.send(CollaborationEvent::ActionPerformed(action));

        Ok(())
    }

    pub async fn update_cursor(
        &self,
        session_id: &str,
        participant_id: &str,
        x: f64,
        y: f64,
        element_ref: Option<String>,
    ) -> anyhow::Result<()> {
        let mut sessions = self.sessions.write().await;
        let session = sessions.get_mut(session_id)
            .ok_or_else(|| anyhow::anyhow!("Session not found"))?;

        if let Some(participant) = session.participants.iter_mut().find(|p| p.id == participant_id) {
            let position = CursorPosition {
                x,
                y,
                element_ref,
                timestamp: Utc::now(),
            };
            participant.cursor_position = Some(position.clone());

            let _ = self.event_sender.send(CollaborationEvent::CursorMoved(participant_id.to_string(), position));
        }

        Ok(())
    }

    pub async fn transfer_control(
        &self,
        session_id: &str,
        from_participant_id: &str,
        to_participant_id: &str,
    ) -> anyhow::Result<()> {
        let mut sessions = self.sessions.write().await;
        let session = sessions.get_mut(session_id)
            .ok_or_else(|| anyhow::anyhow!("Session not found"))?;

        if let Some(from) = session.participants.iter_mut().find(|p| p.id == from_participant_id) {
            from.role = ParticipantRole::Observer;
        }

        if let Some(to) = session.participants.iter_mut().find(|p| p.id == to_participant_id) {
            to.role = ParticipantRole::Controller;
        }

        let _ = self.event_sender.send(CollaborationEvent::ControlTransferred {
            from: from_participant_id.to_string(),
            to: to_participant_id.to_string(),
        });

        Ok(())
    }

    pub async fn get_session(&self, session_id: &str) -> Option<CollaborationSession> {
        let sessions = self.sessions.read().await;
        sessions.get(session_id).cloned()
    }

    pub async fn update_shared_state(
        &self,
        session_id: &str,
        key: &str,
        value: &str,
    ) -> anyhow::Result<()> {
        let mut sessions = self.sessions.write().await;
        let session = sessions.get_mut(session_id)
            .ok_or_else(|| anyhow::anyhow!("Session not found"))?;

        session.shared_state.insert(key.to_string(), value.to_string());

        let _ = self.event_sender.send(CollaborationEvent::StateUpdated(session.shared_state.clone()));

        Ok(())
    }

    pub fn subscribe(&self) -> broadcast::Receiver<CollaborationEvent> {
        self.event_sender.subscribe()
    }
}
