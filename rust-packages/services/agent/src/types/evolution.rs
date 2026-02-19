//! types/evolution.rs

/// Represents the genetic makeup of an agent's operational logic.
/// For this placeholder, it's a simple string, but in a real system,
/// this could be a more complex, structured representation of the Ops traits.
#[derive(Debug, Clone)]
pub struct AgentGenome {
    pub id: String,
    pub fitness: f64, // A score representing the agent's performance
}
