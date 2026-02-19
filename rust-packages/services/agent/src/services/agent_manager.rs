//! services/agent_manager.rs

use crate::components::AgentCore;
use std::collections::HashMap;
use tokio::task::JoinHandle;
use uuid::Uuid;

/// The execution status of a managed agent.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AgentStatus {
    Running,
    Finished,
    NotFound,
}

/// Manages the lifecycle of multiple AI agents.
pub struct AgentManager {
    agents: HashMap<Uuid, JoinHandle<()>>,
}

impl AgentManager {
    /// Creates a new, empty `AgentManager`.
    pub fn new() -> Self {
        Self { agents: HashMap::new() }
    }

    /// Spawns a new agent and starts its execution in a background task.
    ///
    /// # Arguments
    /// * `agent_core` - The `AgentCore` instance to be run.
    ///
    /// # Returns
    /// The `Uuid` of the newly spawned agent.
    pub fn spawn<F>(&mut self, mut agent_core: F) -> Uuid
    where
        F: FnMut() -> AgentCore + Send + 'static, // Simplified for this example
    {
        let agent_id = Uuid::new_v4();
        let handle = tokio::spawn(async move {
            // In a real scenario, this loop would be driven by inputs from a channel.
            // For now, it just runs the agent's step method once.
            // let _ = agent_core.step(&/* some input */).await;
            println!("Agent {} has finished its task.", agent_id);
        });

        self.agents.insert(agent_id, handle);
        agent_id
    }

    /// Terminates a running agent by its ID.
    ///
    /// # Arguments
    /// * `agent_id` - The `Uuid` of the agent to terminate.
    ///
    /// # Returns
    /// `true` if the agent was found and terminated, `false` otherwise.
    pub fn terminate(&mut self, agent_id: &Uuid) -> bool {
        if let Some(handle) = self.agents.remove(agent_id) {
            handle.abort();
            true
        } else {
            false
        }
    }

    /// Retrieves the current status of an agent.
    ///
    /// # Arguments
    /// * `agent_id` - The `Uuid` of the agent to check.
    ///
    /// # Returns
    /// The `AgentStatus` of the agent.
    pub fn get_status(&self, agent_id: &Uuid) -> AgentStatus {
        match self.agents.get(agent_id) {
            Some(handle) if handle.is_finished() => AgentStatus::Finished,
            Some(_) => AgentStatus::Running,
            None => AgentStatus::NotFound,
        }
    }
}

impl Default for AgentManager {
    fn default() -> Self {
        Self::new()
    }
}
