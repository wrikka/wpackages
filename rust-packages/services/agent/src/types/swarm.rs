//! types/swarm.rs

use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// A message sent between agents in the swarm.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SwarmMessage {
    pub source_agent_id: Uuid,
    pub target_agent_id: Uuid,
    pub payload: String, // Can be a serialized enum for different message types
}
