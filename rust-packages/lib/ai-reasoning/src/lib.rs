//! # Reasoning-as-a-System (RaaS)
//!
//! An advanced, agent-based reasoning engine for Rust, built on a formal system model.
//! It uses a dynamic, LLM-driven planner to create and execute complex reasoning plans involving
//! multiple strategies, external tools, and a stable, evaluator-driven feedback loop.
//!
//! ## Features
//!
//! - **Hybrid Reasoning**: Combines LLM-based and symbolic reasoning strategies
//! - **Knowledge Base**: Supports facts, rules, and unification for logical inference
//! - **Multiple Strategies**: Forward/Backward chaining, Chain of Thought, Tree of Thoughts
//! - **Reflection**: Meta-cognitive capabilities for self-improvement

// Declare modules
pub mod agent;
pub mod common;
pub mod config;
pub mod core;
pub mod evaluator;
pub mod formalism;
pub mod llm;
pub mod planner;
pub mod strategies;
pub mod tools;

// Re-export key components for easy access
pub use agent::{ReasoningAgent, ReasoningAgentBuilder, ReasoningMode};
pub use common::{Error, ReasoningInput, ReasoningOutput};
pub use config::AgentConfiguration;
pub use core::{ReasoningStrategy, SymbolicReasoner};
pub use evaluator::{Evaluator, InsightReflector, Reflector};
pub use formalism::{
    Action, Evaluation, Fact, KnowledgeBase, Objective, Observation, Rule, State, Substitution, Term,
    Trace, TraceEntry,
};
pub use llm::LanguageModel;
pub use planner::Planner;
pub use tools::Tool;

/// A prelude module for easy importing of common types.
pub mod prelude {
    pub use crate::agent::{ReasoningAgent, ReasoningAgentBuilder, ReasoningMode};
    pub use crate::common::{Error, ReasoningInput, ReasoningOutput};
    pub use crate::config::AgentConfiguration;
    pub use crate::core::{ReasoningStrategy, SymbolicReasoner};
    pub use crate::evaluator::{Evaluator, InsightReflector, Reflector};
    pub use crate::formalism::{
        Action, Evaluation, Fact, KnowledgeBase, Objective, Observation, Rule, State, Substitution,
        SubstitutionExt, Term, Trace, TraceEntry,
    };
    pub use crate::strategies::{BackwardChainingStrategy, ForwardChainingStrategy};
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn agent_completes_a_simple_run_successfully() {
        let agent = ReasoningAgentBuilder::new(AgentConfiguration::default()).build();
        let input = ReasoningInput {
            query: "What is the capital of France?".to_string(),
        };

        let result = agent.reason(&input).await;

        assert!(result.is_ok());
        let output = result.unwrap();
        assert_eq!(output.result, "The final answer based on the tool output.");
    }

    #[tokio::test]
    async fn agent_stops_after_max_iterations() {
        let agent = ReasoningAgentBuilder::new(AgentConfiguration::default()).build();
        let input = ReasoningInput {
            query: "An impossible query that never resolves".to_string(),
        };

        let result = agent.reason(&input).await;

        assert!(result.is_err());
        if let Err(Error::ProcessingError(msg)) = result {
            assert!(msg.contains("iteration limit"));
        }
    }

    #[tokio::test]
    async fn symbolic_reasoning_forward_chaining() {
        use crate::formalism::*;

        let mut kb = KnowledgeBase::new();
        kb.add_fact(Fact::binary("is", Term::constant("Socrates"), Term::constant("man")));
        kb.add_rule(Rule::simple(
            Fact::binary("is", Term::variable("X"), Term::constant("man")),
            Fact::binary("is", Term::variable("X"), Term::constant("mortal")),
        ));

        let agent = ReasoningAgentBuilder::new(AgentConfiguration::default())
            .with_knowledge_base(kb)
            .build();

        let mut state = State::default();
        state.knowledge_base = agent.knowledge_base.clone().unwrap();

        agent.reason_symbolic("ForwardChaining", &mut state).await.unwrap();

        let expected = Fact::binary("is", Term::constant("Socrates"), Term::constant("mortal"));
        assert!(state.knowledge_base.contains_fact(&expected));
    }
}
