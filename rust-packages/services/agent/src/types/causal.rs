//! types/causal.rs

use serde::{Deserialize, Serialize};

/// Represents a node in a causal graph (e.g., an event or state).
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CausalNode {
    pub id: String,
    pub description: String,
}

/// Represents a directed link in a causal graph.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CausalLink {
    pub cause: String, // ID of the cause node
    pub effect: String, // ID of the effect node
    pub weight: f64,   // Strength of the causal relationship
}

/// Represents a causal model of the environment.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CausalGraph {
    pub nodes: Vec<CausalNode>,
    pub links: Vec<CausalLink>,
}
