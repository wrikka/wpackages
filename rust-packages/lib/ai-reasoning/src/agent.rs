//! # The Reasoning Agent
//! This is the central component that orchestrates the entire reasoning process using the formal system model.
//! Supports both LLM-based and symbolic reasoning strategies.

use crate::common::{Error, ReasoningInput, ReasoningOutput};
use crate::config::AgentConfiguration;
use crate::core::{ReasoningStrategy, SymbolicReasoner};
use crate::evaluator::{Evaluator, InsightReflector, LlmEvaluator, Reflector};
use crate::formalism::{Action, Fact, KnowledgeBase, Observation, State, TraceEntry};
use crate::llm::{LanguageModel, MockLLM};
use crate::planner::{LlmPlanner, Planner};
use crate::strategies::chain_of_thought::ChainOfThoughtStrategy;
use crate::strategies::forward_chaining::ForwardChainingStrategy;
use crate::strategies::simple::SimpleStrategy;
use crate::strategies::tree_of_thoughts::TreeOfThoughtsStrategy;
use crate::tools::calculator::Calculator;
use crate::tools::web_search::WebSearch;
use crate::tools::ToolExecutor;
use std::collections::HashMap;

/// The reasoning mode for the agent
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum ReasoningMode {
    /// Use LLM-based reasoning only
    #[default]
    Llm,
    /// Use symbolic reasoning only
    Symbolic,
    /// Use hybrid reasoning (LLM + symbolic)
    Hybrid,
}

/// The main entry point for the reasoning system, operating on a formal, state-driven loop.
pub struct ReasoningAgent {
    config: AgentConfiguration,
    planner: Box<dyn Planner>,
    evaluator: Box<dyn Evaluator>,
    tool_executor: ToolExecutor,
    strategies: HashMap<String, Box<dyn ReasoningStrategy>>,
    symbolic_reasoners: HashMap<String, Box<dyn SymbolicReasoner>>,
    reflector: Option<Box<dyn Reflector>>,
    mode: ReasoningMode,
    knowledge_base: Option<KnowledgeBase>,
}

pub struct ReasoningAgentBuilder {
    config: AgentConfiguration,
    planner: Option<Box<dyn Planner>>,
    evaluator: Option<Box<dyn Evaluator>>,
    tool_executor: Option<ToolExecutor>,
    strategies: HashMap<String, Box<dyn ReasoningStrategy>>,
    symbolic_reasoners: HashMap<String, Box<dyn SymbolicReasoner>>,
    reflector: Option<Box<dyn Reflector>>,
    mode: ReasoningMode,
    knowledge_base: Option<KnowledgeBase>,
}

impl ReasoningAgentBuilder {
    pub fn new(config: AgentConfiguration) -> Self {
        Self {
            config,
            planner: None,
            evaluator: None,
            tool_executor: None,
            strategies: HashMap::new(),
            symbolic_reasoners: HashMap::new(),
            reflector: None,
            mode: ReasoningMode::default(),
            knowledge_base: None,
        }
    }

    pub fn with_planner(mut self, planner: Box<dyn Planner>) -> Self {
        self.planner = Some(planner);
        self
    }

    pub fn with_evaluator(mut self, evaluator: Box<dyn Evaluator>) -> Self {
        self.evaluator = Some(evaluator);
        self
    }

    pub fn with_tool_executor(mut self, tool_executor: ToolExecutor) -> Self {
        self.tool_executor = Some(tool_executor);
        self
    }

    pub fn with_strategy(mut self, name: &str, strategy: Box<dyn ReasoningStrategy>) -> Self {
        self.strategies.insert(name.to_string(), strategy);
        self
    }

    pub fn with_symbolic_reasoner(mut self, name: &str, reasoner: Box<dyn SymbolicReasoner>) -> Self {
        self.symbolic_reasoners.insert(name.to_string(), reasoner);
        self
    }

    pub fn with_reflector(mut self, reflector: Box<dyn Reflector>) -> Self {
        self.reflector = Some(reflector);
        self
    }

    pub fn with_mode(mut self, mode: ReasoningMode) -> Self {
        self.mode = mode;
        self
    }

    pub fn with_knowledge_base(mut self, kb: KnowledgeBase) -> Self {
        self.knowledge_base = Some(kb);
        self
    }

    pub fn build(self) -> ReasoningAgent {
        let planner = self.planner.unwrap_or_else(|| Box::new(LlmPlanner::new()));
        let evaluator = self.evaluator.unwrap_or_else(|| Box::new(LlmEvaluator::new()));
        let tool_executor = self.tool_executor.unwrap_or_else(|| {
            let mut executor = ToolExecutor::new();
            executor.register(Box::new(Calculator::new()));
            executor.register(Box::new(WebSearch::new()));
            executor
        });

        let strategies = if self.strategies.is_empty() {
            let mut s: HashMap<String, Box<dyn ReasoningStrategy>> = HashMap::new();
            s.insert("SimpleStrategy".to_string(), Box::new(SimpleStrategy::new()));
            s.insert("ChainOfThoughtStrategy".to_string(), Box::new(ChainOfThoughtStrategy::new()));
            s.insert("TreeOfThoughtsStrategy".to_string(), Box::new(TreeOfThoughtsStrategy::new()));
            s
        } else {
            self.strategies
        };

        let symbolic_reasoners = if self.symbolic_reasoners.is_empty() {
            let mut s: HashMap<String, Box<dyn SymbolicReasoner>> = HashMap::new();
            s.insert("ForwardChaining".to_string(), Box::new(ForwardChainingStrategy::new()));
            s
        } else {
            self.symbolic_reasoners
        };

        ReasoningAgent {
            config: self.config,
            planner,
            evaluator,
            tool_executor,
            strategies,
            symbolic_reasoners,
            reflector: self.reflector,
            mode: self.mode,
            knowledge_base: self.knowledge_base,
        }
    }
}

impl ReasoningAgent {
    /// Creates a new builder for constructing a ReasoningAgent
    pub fn builder(config: AgentConfiguration) -> ReasoningAgentBuilder {
        ReasoningAgentBuilder::new(config)
    }

    /// The primary method to process a query using the Decide-Execute-Evaluate loop.
    pub async fn reason(&self, input: &ReasoningInput) -> Result<ReasoningOutput, Error> {
        let mut state = match &self.knowledge_base {
            Some(kb) => State::with_knowledge_base(input, kb.clone()),
            None => State::from_input(input),
        };

        for _ in 0..self.config.max_iterations {
            // 1. Decide the next action based on the current state.
            let action = self.planner.decide_next_action(&state).await?;

            // 2. Execute the action.
            let observation = self.execute_action(&action, &mut state).await?;

            // 3. Update the state with the new action and observation.
            state.trace.entries.push(TraceEntry { action, observation });
            state.steps_executed += 1;

            // 4. Run reflection if available
            if let Some(reflector) = &mut self.reflector.as_ref() {
                // Note: Reflector trait requires &mut self, so we can't call it here directly
                // In a real implementation, we'd need interior mutability
            }

            // 5. Evaluate the new state.
            let evaluation = self.evaluator.evaluate_state(&state).await?;
            if evaluation.is_sufficient {
                if let Some(last_entry) = state.trace.entries.last() {
                    if let Action::Finish { result } = &last_entry.action {
                        return Ok(ReasoningOutput { result: result.clone() });
                    }
                }
                return Err(Error::ProcessingError(
                    "Evaluation was sufficient but no final answer was provided.".to_string(),
                ));
            }
        }

        Err(Error::ProcessingError(
            "Agent failed to find a sufficient answer within the iteration limit.".to_string(),
        ))
    }

    /// Performs symbolic reasoning using the specified reasoner
    pub async fn reason_symbolic(&self, reasoner_name: &str, state: &mut State) -> Result<(), Error> {
        let reasoner = self
            .symbolic_reasoners
            .get(reasoner_name)
            .ok_or_else(|| Error::ProcessingError(format!("Symbolic reasoner '{}' not found", reasoner_name)))?;
        reasoner.reason_symbolic(state).await
    }

    /// Queries the knowledge base using symbolic reasoning
    pub async fn query_knowledge(&self, reasoner_name: &str, goal: &Fact) -> Result<Vec<crate::formalism::Substitution>, Error> {
        let state = State::default();
        let reasoner = self
            .symbolic_reasoners
            .get(reasoner_name)
            .ok_or_else(|| Error::ProcessingError(format!("Symbolic reasoner '{}' not found", reasoner_name)))?;
        reasoner.query(&state, goal).await
    }

    /// Helper function to execute a single action and return the observation.
    async fn execute_action(&self, action: &Action, state: &mut State) -> Result<Observation, Error> {
        match action {
            Action::CallTool { tool_name, input } => {
                let output = self.tool_executor.execute(tool_name, input).await?;
                Ok(Observation::Tool(output))
            }
            Action::InvokeStrategy { strategy_name, input } => {
                let strategy = self
                    .strategies
                    .get(strategy_name)
                    .ok_or_else(|| Error::ProcessingError(format!("Strategy '{}' not found", strategy_name)))?;
                let output = strategy.reason(input).await?;
                Ok(Observation::Strategy(output))
            }
            Action::QueryKnowledge { query } => {
                // Use forward chaining by default for queries
                if let Some(reasoner) = self.symbolic_reasoners.get("ForwardChaining") {
                    let solutions = reasoner.query(state, query).await?;
                    Ok(Observation::SymbolicQuery(solutions))
                } else {
                    Err(Error::ProcessingError("No symbolic reasoner available".to_string()))
                }
            }
            Action::AssertFact { fact } => {
                state.knowledge_base.add_fact(fact.clone());
                state.new_facts_derived = true;
                Ok(Observation::FactAsserted)
            }
            Action::Finish { .. } => {
                // The Finish action doesn't produce an observation; it's a terminal state.
                Ok(Observation::None)
            }
        }
    }
}

impl Default for ReasoningAgent {
    fn default() -> Self {
        Self::builder(AgentConfiguration::default()).build()
    }
}

