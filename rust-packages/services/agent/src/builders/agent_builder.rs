//! builders/agent_builder.rs

use crate::components::{AgentCore, ParallelCritic};
use crate::config::agent_config::AgentConfig;
use crate::services::{ComponentRegistry, LlmBatcher, ReasoningCache, ToolRegistry};
use crate::templates::basic::*;
use std::sync::Arc;

/// Constructs an `AgentCore` instance from a declarative configuration.
pub struct AgentBuilder<'a> {
    config: AgentConfig,
    registry: &'a ComponentRegistry,
}

impl<'a> AgentBuilder<'a> {
    /// Creates a new builder from an agent configuration and a component registry.
    pub fn from_config(config: AgentConfig, registry: &'a ComponentRegistry) -> Self {
        Self { config, registry }
    }

    /// Builds the `AgentCore` instance by dynamically loading components.
    pub fn build(
        self,
    ) -> AgentCore<
        BasicInput,
        BasicState,
        BasicOps,
        BasicMemory,
        BasicBudget,
        Arc<ParallelCritic>,
        Arc<BasicPolicy>,
        LlmBatcher,
        ReasoningCache<BasicWorldModel, BasicPlan>,
        ToolRegistry,
    > {
        println!("Building agent '{}' from config...", self.config.name);

        let policy = self
            .registry
            .get(&self.config.policy)
            .expect("Policy not found")
            .as_any()
            .downcast_ref::<Arc<BasicPolicy>>()
            .expect("Failed to downcast Policy")
            .clone();

        let critic = self
            .registry
            .get(&self.config.critic)
            .expect("Critic not found")
            .as_any()
            .downcast_ref::<Arc<ParallelCritic>>()
            .expect("Failed to downcast Critic")
            .clone();

        AgentCore {
            ops: BasicOps,
            state: BasicState { last_result: "".to_string() },
            memory: BasicMemory,
            budget: BasicBudget,
            critic,
            policy,
            batcher: LlmBatcher::new(),
            plan_cache: ReasoningCache::new(),
            tool_registry: ToolRegistry::new(),
            _input: std::marker::PhantomData,
        }
    }
}
