pub mod affective;
pub mod core;
pub mod error;
pub mod llm;
pub mod benchmark;
pub mod budget;
pub mod causal;
pub mod consolidation;
pub mod correction;
pub mod debug;
pub mod dynamic;
pub mod energy;
pub mod evolution;
pub mod feedback;
pub mod goal;
pub mod improvement;
pub mod marketplace;
pub mod multimodal;
pub mod persona;
pub mod plan;
pub mod prediction;
pub mod reasoning;
pub mod safety;
pub mod sandbox;
pub mod snapshot;
pub mod swarm;
pub mod symbolic;
pub mod testing;
pub mod tool;
pub mod traits;
pub mod ui;
pub mod zkp;

use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Agent {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: Uuid,
    pub agent_id: Uuid,
    pub description: String,
    pub status: TaskStatus,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TaskStatus {
    Pending,
    InProgress,
    Completed,
    Failed,
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tool {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub id: Uuid,
    pub role: MessageRole,
    pub content: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MessageRole {
    System,
    User,
    Assistant,
    Tool,
}
