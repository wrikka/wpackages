// d:\wai\rust-packages\ai\ai-agent\src\types\traits.rs

//! Contains the modular traits that define the capabilities and components of an `AgentCore`.

use crate::types::error::AgentCoreError;
use async_trait::async_trait;

// --- Core Agent Operation Traits ---

/// Analyzes the input and current state to produce a context.
/// This is the first step in the agent's reasoning cycle.
#[async_trait]
pub trait Analyzer<Input, State, Batcher, Registry> {
    /// The type of context produced by the analyzer.
    type Context;
    /// Performs the analysis.
    async fn analyze(&self, input: &Input, state: &State, batcher: &Batcher, registry: &Registry) -> Result<Self::Context, AgentCoreError>;
}

/// Updates the world model based on the latest context.
#[async_trait]
pub trait WorldModeler<Context, Batcher, Registry> {
    /// The type representing the agent's understanding of the world.
    type WorldModel;
    /// Updates the world model.
    async fn update_world_model(&self, context: &Context, batcher: &Batcher, registry: &Registry) -> Result<Self::WorldModel, AgentCoreError>;
}

/// Formulates a high-level strategy or plan.
#[async_trait]
pub trait Planner<WorldModel, Policy, Batcher, Registry> {
    /// The type of plan generated.
    type Plan;
    /// Creates a plan based on the current world model and policy.
    async fn plan_strategy(&self, world: &WorldModel, policy: &Policy, batcher: &Batcher, registry: &Registry) -> Result<Self::Plan, AgentCoreError>;
}

/// Expands the search space of possible actions from a given plan.
#[async_trait]
pub trait SearchExpander<Plan, Batcher, Registry> {
    /// The data structure representing the expanded search space.
    type SearchSpace;
    /// Expands the search space.
    async fn expand_search_space(&self, plan: &Plan, batcher: &Batcher, registry: &Registry) -> Result<Self::SearchSpace, AgentCoreError>;
}

/// Simulates outcomes for various possibilities within a search space.
#[async_trait]
pub trait Simulator<SearchSpace, Batcher, Registry> {
    /// The result of a single simulation.
    type Simulation;
    /// Runs the simulation process, returning a collection of individual simulations.
    async fn simulate(&self, search_space: SearchSpace, batcher: &Batcher, registry: &Registry) -> Result<Vec<Self::Simulation>, AgentCoreError>;
}

/// Evaluates or critiques a collection of simulations to determine their potential value.
#[async_trait]
pub trait Critic<Simulation, Batcher, Registry> {
    /// The result of an evaluation for a single simulation.
    type Evaluation;
    /// Evaluates a vector of simulations, returning a corresponding vector of evaluations.
    async fn evaluate(&self, simulations: Vec<Simulation>, batcher: &Batcher, registry: &Registry) -> Result<Vec<Self::Evaluation>, AgentCoreError>;
}

/// Selects a final, concrete action from a collection of evaluations.
#[async_trait]
pub trait ActionSelector<Evaluation, Batcher, Registry> {
    /// The type representing the final decision.
    type Decision;
    /// Selects the best action from a set of evaluations.
    async fn select_action(&self, evaluations: Vec<Evaluation>, batcher: &Batcher, registry: &Registry) -> Result<Self::Decision, AgentCoreError>;
}

/// Executes a decision in the environment.
#[async_trait]
pub trait Executor<Decision, Batcher, Registry> {
    /// The result of the execution.
    type ExecutionResult;
    /// Executes the decision.
    async fn execute(&self, decision: Decision, batcher: &Batcher, registry: &Registry) -> Result<Self::ExecutionResult, AgentCoreError>;
}

/// Learns from an execution result and updates the agent's internal state.
#[async_trait]
pub trait Learner<State, ExecutionResult, Batcher, Registry> {
    /// Updates the state based on the outcome of an action.
    async fn learn(&self, state: &mut State, execution_result: &ExecutionResult, batcher: &Batcher, registry: &Registry) -> Result<(), AgentCoreError>;
}

// --- Dependency Traits ---

/// A trait for agent memory systems.
pub trait AgentMemory {
    // In a real implementation, this would have methods like:
    // fn store(&mut self, experience: Experience) -> Result<(), MemoryError>;
    // fn retrieve(&self, query: &Query) -> Result<Vec<Experience>, MemoryError>;
}

use crate::types::budget::CostRecord;
use crate::types::prediction::CostPrediction;

/// A trait for managing the agent's operational budget (e.g., tokens, API calls).
#[async_trait]
pub trait BudgetManager: Send + Sync {
    /// Records a cost against the budget.
    async fn record_cost(&self, record: CostRecord);

    /// Checks if the budget has been exceeded.
    /// Returns `true` if the budget is exceeded, `false` otherwise.
    async fn is_exceeded(&self) -> bool;

    /// Checks if a predicted cost would exceed the budget.
    async fn check_predicted_cost(&self, prediction: &CostPrediction) -> bool;
}

/// A trait representing an agent's guiding principles or policy.
pub trait Policy {
    // In a real implementation, this could guide the planner:
    // fn get_guidelines(&self) -> &Guidelines;
}

// --- Composite Operations Trait ---

/// A blanket trait that combines all core operational traits for convenience.
///
/// This trait is automatically implemented for any type that implements all the required sub-traits.
/// It simplifies the trait bounds on `AgentCore`.
pub trait AgentOps<Input, State, WorldModel, Plan, SearchSpace, Simulation, Evaluation, Decision, ExecutionResult, Policy>: 
    Analyzer<Input, State, Context = WorldModel> +
    WorldModeler<WorldModel, WorldModel = WorldModel> +
    Planner<WorldModel, Policy, Plan = Plan> +
    SearchExpander<Plan, SearchSpace = SearchSpace> +
    Simulator<SearchSpace, Simulation = Simulation> +
    // Note: The Critic is a separate dependency, not part of the main ops pipeline.
    ActionSelector<Evaluation, Decision = Decision> +
    Executor<Decision, ExecutionResult = ExecutionResult> +
    Learner<State, ExecutionResult>
{}

impl<T, Input, State, WorldModel, Plan, SearchSpace, Simulation, Evaluation, Decision, ExecutionResult, Policy> AgentOps<Input, State, WorldModel, Plan, SearchSpace, Simulation, Evaluation, Decision, ExecutionResult, Policy> for T where T: 
    Analyzer<Input, State, Context = WorldModel> +
    WorldModeler<WorldModel, WorldModel = WorldModel> +
    Planner<WorldModel, Policy, Plan = Plan> +
    SearchExpander<Plan, SearchSpace = SearchSpace> +
    Simulator<SearchSpace, Simulation = Simulation> +
    ActionSelector<Evaluation, Decision = Decision> +
    Executor<Decision, ExecutionResult = ExecutionResult> +
    Learner<State, ExecutionResult>
{}

