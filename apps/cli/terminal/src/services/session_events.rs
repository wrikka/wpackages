use crate::types::{Session, SessionId};
use serde::Serialize;

#[derive(Clone, Serialize)]
pub struct SessionEvent {
    pub event_type: SessionEventType,
    pub session_id: Option<SessionId>,
    pub session: Option<Session>,
}

#[derive(Clone, Serialize)]
pub enum SessionEventType {
    Created,
    Updated,
    Deleted,
    Activated,
    Saved,
    Restored,
}
