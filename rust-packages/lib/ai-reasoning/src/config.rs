//! # Agent Configuration
//! Defines the configuration for the ReasoningAgent.

#[derive(Debug, Clone)]
pub struct AgentConfiguration {
    pub max_iterations: u32,
}

impl Default for AgentConfiguration {
    fn default() -> Self {
        Self { max_iterations: 10 }
    }
}
