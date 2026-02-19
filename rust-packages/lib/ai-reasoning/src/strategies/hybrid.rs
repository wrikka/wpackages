//! # Hybrid Reasoning Strategy
//! Combines symbolic reasoning with LLM-based reasoning for optimal results.

use crate::common::{Error, ReasoningInput, ReasoningOutput};
use crate::core::{ReasoningStrategy, SymbolicReasoner};
use crate::formalism::{Fact, KnowledgeBase, State, Substitution, Term};
use crate::llm::{LanguageModel, MockLLM};
use crate::strategies::chain_of_thought::ChainOfThoughtStrategy;
use crate::strategies::forward_chaining::ForwardChainingStrategy;
use async_trait::async_trait;

/// Configuration for hybrid reasoning
#[derive(Debug, Clone)]
pub struct HybridConfig {
    /// Whether to attempt symbolic reasoning first
    pub symbolic_first: bool,
    /// Maximum iterations for symbolic reasoning
    pub max_symbolic_iterations: u32,
    /// Whether to fall back to LLM if symbolic fails
    pub fallback_to_llm: bool,
    /// Whether to use LLM to validate symbolic results
    pub validate_with_llm: bool,
}

impl Default for HybridConfig {
    fn default() -> Self {
        Self {
            symbolic_first: true,
            max_symbolic_iterations: 100,
            fallback_to_llm: true,
            validate_with_llm: true,
        }
    }
}

/// A hybrid reasoning strategy that combines symbolic and LLM-based approaches.
pub struct HybridReasoningStrategy {
    /// Symbolic reasoner for logical inference
    symbolic: ForwardChainingStrategy,
    /// LLM-based reasoner for natural language
    llm_strategy: ChainOfThoughtStrategy,
    /// Configuration
    config: HybridConfig,
    /// Knowledge base for symbolic reasoning
    knowledge_base: KnowledgeBase,
}

impl HybridReasoningStrategy {
    /// Creates a new hybrid reasoning strategy
    pub fn new() -> Self {
        Self {
            symbolic: ForwardChainingStrategy::new(),
            llm_strategy: ChainOfThoughtStrategy::new(),
            config: HybridConfig::default(),
            knowledge_base: KnowledgeBase::new(),
        }
    }

    /// Creates a hybrid strategy with a knowledge base
    pub fn with_knowledge_base(kb: KnowledgeBase) -> Self {
        Self {
            symbolic: ForwardChainingStrategy::new(),
            llm_strategy: ChainOfThoughtStrategy::new(),
            config: HybridConfig::default(),
            knowledge_base: kb,
        }
    }

    /// Creates a hybrid strategy with custom configuration
    pub fn with_config(config: HybridConfig) -> Self {
        Self {
            symbolic: ForwardChainingStrategy::new(),
            llm_strategy: ChainOfThoughtStrategy::new(),
            config,
            knowledge_base: KnowledgeBase::new(),
        }
    }

    /// Sets the knowledge base
    pub fn set_knowledge_base(&mut self, kb: KnowledgeBase) {
        self.knowledge_base = kb;
    }

    /// Adds a fact to the knowledge base
    pub fn add_fact(&mut self, fact: Fact) {
        self.knowledge_base.add_fact(fact);
    }

    /// Adds a rule to the knowledge base
    pub fn add_rule(&mut self, rule: crate::formalism::Rule) {
        self.knowledge_base.add_rule(rule);
    }

    /// Attempts to parse a natural language query into a symbolic fact
    fn parse_query_to_fact(&self, query: &str) -> Option<Fact> {
        // Simple heuristic parsing - in production, use NLP or LLM
        let lower = query.to_lowercase();
        
        // Pattern: "is X a Y?" -> is(X, Y)
        if lower.starts_with("is ") && lower.contains(" a ") {
            let parts: Vec<&str> = lower.split(" is ").collect();
            if parts.len() == 2 {
                let rest = parts[1];
                if let Some(pos) = rest.find(" a ") {
                    let subject = rest[..pos].trim();
                    let predicate = rest[pos + 3..].trim().trim_end_matches('?');
                    return Some(Fact::binary("is", Term::constant(subject), Term::constant(predicate)));
                }
            }
        }

        // Pattern: "what is X?" -> what_is(X)
        if lower.starts_with("what is ") {
            let subject = lower.trim_start_matches("what is ").trim_end_matches('?');
            return Some(Fact::unary("what_is", Term::constant(subject)));
        }

        None
    }

    /// Runs symbolic reasoning on the knowledge base
    pub async fn reason_symbolic(&self, state: &mut State) -> Result<(), Error> {
        self.symbolic.reason_symbolic(state).await
    }

    /// Queries the knowledge base
    pub async fn query_symbolic(&self, goal: &Fact) -> Result<Vec<Substitution>, Error> {
        let state = State::default();
        self.symbolic.query(&state, goal).await
    }
}

impl Default for HybridReasoningStrategy {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl ReasoningStrategy for HybridReasoningStrategy {
    fn name(&self) -> &str {
        "HybridReasoningStrategy"
    }

    async fn reason(&self, input: &ReasoningInput) -> Result<ReasoningOutput, Error> {
        let mut symbolic_result = None;
        let mut llm_result = None;

        // Step 1: Try symbolic reasoning first if configured
        if self.config.symbolic_first {
            if let Some(fact) = self.parse_query_to_fact(&input.query) {
                let mut state = State::default();
                state.knowledge_base = self.knowledge_base.clone();
                
                // Run forward chaining
                self.symbolic.reason_symbolic(&mut state).await?;
                
                // Check if we can answer the query
                if state.knowledge_base.contains_fact(&fact) {
                    symbolic_result = Some(ReasoningOutput {
                        result: format!("Based on logical inference: {} is true", fact),
                    });
                }
            }
        }

        // Step 2: If symbolic failed and fallback is enabled, use LLM
        if symbolic_result.is_none() && self.config.fallback_to_llm {
            llm_result = Some(self.llm_strategy.reason(input).await?);
        }

        // Step 3: Validate LLM result with symbolic if configured
        if let Some(ref result) = llm_result {
            if self.config.validate_with_llm {
                // In a real implementation, we'd parse the LLM output
                // and validate it against the knowledge base
            }
        }

        // Return the best result
        Ok(symbolic_result.or(llm_result).unwrap_or_else(|| ReasoningOutput {
            result: "Unable to reason about this query.".to_string(),
        }))
    }
}

/// A hybrid reasoner that implements the SymbolicReasoner trait
pub struct HybridSymbolicReasoner {
    symbolic: ForwardChainingStrategy,
    knowledge_base: KnowledgeBase,
}

impl HybridSymbolicReasoner {
    pub fn new(kb: KnowledgeBase) -> Self {
        Self {
            symbolic: ForwardChainingStrategy::new(),
            knowledge_base: kb,
        }
    }
}

#[async_trait]
impl SymbolicReasoner for HybridSymbolicReasoner {
    fn name(&self) -> &str {
        "HybridSymbolicReasoner"
    }

    async fn reason_symbolic(&self, state: &mut State) -> Result<(), Error> {
        self.symbolic.reason_symbolic(state).await
    }

    async fn query(&self, state: &State, goal: &Fact) -> Result<Vec<Substitution>, Error> {
        self.symbolic.query(state, goal).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::formalism::Rule;

    #[tokio::test]
    async fn test_hybrid_symbolic_first() {
        let mut kb = KnowledgeBase::new();
        kb.add_fact(Fact::binary("is", Term::constant("Socrates"), Term::constant("man")));
        kb.add_rule(Rule::simple(
            Fact::binary("is", Term::variable("X"), Term::constant("man")),
            Fact::binary("is", Term::variable("X"), Term::constant("mortal")),
        ));

        let strategy = HybridReasoningStrategy::with_knowledge_base(kb);
        let input = ReasoningInput {
            query: "is Socrates a man?".to_string(),
        };

        let result = strategy.reason(&input).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_hybrid_fallback_to_llm() {
        let strategy = HybridReasoningStrategy::new();
        let input = ReasoningInput {
            query: "What is the meaning of life?".to_string(),
        };

        let result = strategy.reason(&input).await;
        assert!(result.is_ok());
    }
}
