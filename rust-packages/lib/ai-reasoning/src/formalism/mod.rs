//! # The Formal System Model
//! This module defines the core data structures that provide a rigorous, executable specification
//! for the reasoning process. It turns abstract concepts into concrete, measurable types.

pub mod symbolic;
pub mod unification;

use crate::common::{ReasoningInput, ReasoningOutput};
use crate::tools::{ToolInput, ToolOutput};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// Re-export symbolic types for convenience
pub use symbolic::{Fact, KnowledgeBase, Rule, Term};
pub use unification::{apply, apply_subst_to_fact, unify, unify_facts, Substitution, SubstitutionExt};

/// Represents a single, atomic operation the agent can perform.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Action {
    CallTool {
        tool_name: String,
        input: ToolInput,
    },
    InvokeStrategy {
        strategy_name: String,
        input: ReasoningInput,
    },
    /// Query the symbolic knowledge base
    QueryKnowledge {
        query: Fact,
    },
    /// Assert a fact into the knowledge base
    AssertFact {
        fact: Fact,
    },
    // Represents the final answer action from the agent.
    Finish {
        result: String,
    },
}

/// Represents the outcome or result observed after performing an Action.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Observation {
    Tool(ToolOutput),
    Strategy(ReasoningOutput),
    /// Result from a symbolic query
    SymbolicQuery(Vec<Substitution>),
    /// Confirmation of fact assertion
    FactAsserted,
    // Observation for the Finish action is implicit (the final output itself).
    None,
}

/// A single entry in the execution trace, pairing an Action with its resulting Observation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TraceEntry {
    pub action: Action,
    pub observation: Observation,
}

/// The complete, ordered history of an agent's execution run.
/// This is the primary artifact for debugging, explainability, and reproducibility.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Trace {
    pub id: Uuid,
    pub entries: Vec<TraceEntry>,
}

impl Trace {
    pub fn new() -> Self {
        Self { id: Uuid::new_v4(), entries: Vec::new() }
    }
}

/// Encapsulates the entire current state of the reasoning process.
/// This is the primary input for the Planner.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct State {
    pub initial_query: String,
    pub trace: Trace,
    /// Symbolic knowledge base for logical reasoning
    pub knowledge_base: KnowledgeBase,
    /// Number of reasoning steps executed
    pub steps_executed: u32,
    /// Whether new facts were derived in the last cycle
    pub new_facts_derived: bool,
}

impl State {
    pub fn from_input(input: &ReasoningInput) -> Self {
        Self {
            initial_query: input.query.clone(),
            trace: Trace::new(),
            knowledge_base: KnowledgeBase::new(),
            steps_executed: 0,
            new_facts_derived: false,
        }
    }

    /// Creates a state with an existing knowledge base
    pub fn with_knowledge_base(input: &ReasoningInput, kb: KnowledgeBase) -> Self {
        Self {
            initial_query: input.query.clone(),
            trace: Trace::new(),
            knowledge_base: kb,
            steps_executed: 0,
            new_facts_derived: false,
        }
    }
}

impl Default for State {
    fn default() -> Self {
        Self {
            initial_query: String::new(),
            trace: Trace::new(),
            knowledge_base: KnowledgeBase::new(),
            steps_executed: 0,
            new_facts_derived: false,
        }
    }
}

/// A quantifiable, machine-readable definition of the goal.
/// This is the ground truth for the Evaluator.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Objective {
    pub correctness: f32,    // 0.0 to 1.0, how factually correct is the answer?
    pub completeness: f32,   // 0.0 to 1.0, does it fully answer the user's query?
    pub cost: f32,           // A metric for resource usage (e.g., tokens, time).
}

/// The output of the Evaluator, providing a structured assessment of a Trace against an Objective.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Evaluation {
    pub objective_scores: Objective,
    pub feedback: Option<String>, // Actionable feedback if the objective is not met.
    pub is_sufficient: bool,      // True if the objective has been met.
}
