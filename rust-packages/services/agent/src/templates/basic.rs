//! src/templates/basic.rs

use crate::components::{AgentCore, DefaultMetaCognitive, ParallelCritic};
use crate::types::reasoning::ReasoningStrategy;
use crate::services::{LlmBatcher, ReasoningCache, ToolRegistry};
use crate::types::dynamic::DynamicComponent;
use crate::types::error::AgentCoreError;
use crate::types::correction::Outcome;
use crate::types::multimodal::Content;
use crate::types::traits::*;
use async_trait::async_trait;
use serde_json::Value;

// --- Default Components ---

#[derive(Clone)]
pub struct BasicState { pub last_result: String }

#[derive(Clone)]
pub struct BasicInput { pub content: Vec<Content> }

#[derive(Clone)]
pub struct BasicContext { pub goal: String }

#[derive(Clone, Hash, Eq, PartialEq)]
pub struct BasicWorldModel { pub goal: String }
#[derive(Clone)] pub struct BasicPlan;
#[derive(Clone)] pub struct BasicSearchSpace;
#[derive(Clone)] pub struct BasicSimulation;
#[derive(Clone)] pub struct BasicEvaluation;
#[derive(Clone)] pub struct BasicDecision;
#[derive(Clone)]
pub struct BasicExecutionResult {
    pub content: Vec<Content>,
    pub outcome: Outcome,
}

#[derive(Clone)] pub struct BasicMemory;
impl AgentMemory for BasicMemory {}

#[derive(Clone)] pub struct BasicBudget;
impl BudgetManager for BasicBudget {}

#[derive(Clone)] pub struct BasicPolicy;
impl Policy for BasicPolicy {}
impl DynamicComponent for BasicPolicy {
    fn as_any(&self) -> &dyn std::any::Any {
        self
    }
}

/// A basic, placeholder implementation of the agent's operational logic.
#[derive(Clone)]
pub struct BasicOps;

#[async_trait]
impl Analyzer<BasicInput, BasicState, LlmBatcher, ToolRegistry> for BasicOps {
    type Context = BasicContext;
    async fn analyze(&self, input: &BasicInput, _: &BasicState, _: &LlmBatcher, _: &ToolRegistry) -> Result<Self::Context, AgentCoreError> {
        let goal = input.content.iter().map(|c| match c {
            Content::Text(text) => text.clone(),
            _ => "".to_string(),
        }).collect::<Vec<_>>().join("\n");
        Ok(BasicContext { goal })
    }
}

#[async_trait]
impl WorldModeler<BasicContext, LlmBatcher, ToolRegistry> for BasicOps {
    type WorldModel = BasicWorldModel;
    async fn update_world_model(&self, context: &BasicContext, _: &LlmBatcher, _: &ToolRegistry) -> Result<Self::WorldModel, AgentCoreError> {
        Ok(BasicWorldModel { goal: context.goal.clone() })
    }
}

#[async_trait]
impl Planner<BasicWorldModel, BasicPolicy, LlmBatcher, ToolRegistry> for BasicOps {
    type Plan = BasicPlan;
    async fn plan_strategy(&self, _world: &BasicWorldModel, _policy: &BasicPolicy, _batcher: &LlmBatcher, _registry: &ToolRegistry) -> Result<Self::Plan, AgentCoreError> {
        Ok(BasicPlan)
    }
}

#[async_trait]
impl SearchExpander<BasicPlan, LlmBatcher, ToolRegistry> for BasicOps {
    type SearchSpace = BasicSearchSpace;
    async fn expand_search_space(&self, _plan: &BasicPlan, _batcher: &LlmBatcher, _registry: &ToolRegistry) -> Result<Self::SearchSpace, AgentCoreError> {
        Ok(BasicSearchSpace)
    }
}

#[async_trait]
impl Simulator<BasicSearchSpace, LlmBatcher, ToolRegistry> for BasicOps {
    type Simulation = BasicSimulation;
    async fn simulate(&self, _search_space: BasicSearchSpace, _batcher: &LlmBatcher, _registry: &ToolRegistry) -> Result<Vec<Self::Simulation>, AgentCoreError> {
        Ok(vec![BasicSimulation])
    }
}

#[async_trait]
impl ActionSelector<BasicEvaluation, LlmBatcher, ToolRegistry> for BasicOps {
    type Decision = BasicDecision;
    async fn select_action(&self, _evaluations: Vec<BasicEvaluation>, _batcher: &LlmBatcher, _registry: &ToolRegistry) -> Result<Self::Decision, AgentCoreError> {
        Ok(BasicDecision)
    }
}

#[async_trait]
impl Executor<BasicDecision, LlmBatcher, ToolRegistry> for BasicOps {
    type ExecutionResult = BasicExecutionResult;
    async fn execute(&self, _decision: BasicDecision, _batcher: &LlmBatcher, _registry: &ToolRegistry) -> Result<Self::ExecutionResult, AgentCoreError> {
        Ok(BasicExecutionResult {
            content: vec![],
            outcome: Outcome::Success,
        })
    }
}

#[async_trait]
impl Learner<BasicState, BasicExecutionResult, LlmBatcher, ToolRegistry> for BasicOps {
    async fn learn(&self, _state: &mut BasicState, _execution_result: &BasicExecutionResult, _batcher: &LlmBatcher, _registry: &ToolRegistry) -> Result<(), AgentCoreError> {
        Ok(())
    }
}

/// Assembles and returns a basic, ready-to-use `AgentCore`.
pub fn new_basic_agent() -> AgentCore<
    BasicInput,
    BasicState,
    BasicOps,
    BasicMemory,
    BasicBudget,
    ParallelCritic,
    BasicPolicy,
    LlmBatcher,
    ReasoningCache<BasicWorldModel, BasicPlan>,
    ToolRegistry,
    DefaultMetaCognitive,
> {
    AgentCore {
        ops: BasicOps,
        state: BasicState { last_result: "".to_string() },
        memory: BasicMemory,
        budget: BasicBudget,
        critic: ParallelCritic,
        policy: BasicPolicy,
        batcher: LlmBatcher::new(),
        plan_cache: ReasoningCache::new(),
        tool_registry: ToolRegistry::new(),
        meta_cognitive: DefaultMetaCognitive::new(ReasoningStrategy::ReAct),
        _input: std::marker::PhantomData,
    }
}
