//! components/planner.rs

use crate::services::{LlmBatcher, ToolRegistry};
use crate::templates::basic::BasicWorldModel;
use crate::types::error::AgentCoreError;
use crate::types::llm::LlmRequest;
use crate::types::plan::{HierarchicalPlan, SubTask};
use crate::types::traits::{Planner, Policy};
use crate::services::{LlmBatcher, ToolRegistry};
use async_trait::async_trait;
use uuid::Uuid;

/// A planner that generates a structured, hierarchical plan of tasks.
#[derive(Clone, Default)]
pub struct HierarchicalPlanner;

impl HierarchicalPlanner {
    pub fn new() -> Self {
        Self::default()
    }
}

#[async_trait]
#[async_trait]
impl<P> Planner<BasicWorldModel, P, LlmBatcher, ToolRegistry> for HierarchicalPlanner
where
    P: Policy + Send + Sync,
{
    type Plan = HierarchicalPlan;

    /// Generates a dynamic hierarchical plan using an LLM.
    async fn plan_strategy(
        &self,
        world: &BasicWorldModel,
        _policy: &P,
        batcher: &B,
        _registry: &R,
    ) -> Result<Self::Plan, AgentCoreError> {
        let prompt = format!(
            "Based on the goal '{}', break it down into a series of sub-tasks. Respond with a JSON object containing a 'tasks' array. Each task should have an 'id', 'description', and 'parent_id'.",
            world.goal
        );

        let request = LlmRequest {
            id: Uuid::new_v4().to_string(),
            prompt,
            // Add other request parameters as needed
        };

        let response = batcher.request(request).await;
        let plan: HierarchicalPlan = serde_json::from_str(&response.content)
            .map_err(|e| AgentCoreError::PlanningError(e.to_string()))?;

        Ok(plan)
    }
}
