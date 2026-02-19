//! config/agent_config.rs

use serde::Deserialize;

/// Represents the declarative configuration for an AI agent.
#[derive(Debug, Deserialize)]
pub struct AgentConfig {
    pub name: String,
    pub version: String,
    pub policy: String,
    pub critic: String,
}
