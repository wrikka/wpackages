//! types/persona.rs

use serde::{Deserialize, Serialize};

/// Represents an agent's persona, influencing its behavior and communication style.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Persona {
    pub name: String,
    pub backstory: String,
    pub communication_style: String, // e.g., "formal", "casual", "humorous"
}
