//! types/goal.rs

use serde::{Deserialize, Serialize};

/// Represents a potential goal for the agent to pursue.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Goal {
    pub description: String,
    pub priority: f32, // A value from 0.0 to 1.0
}
