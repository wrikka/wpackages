use crate::common::{Error, ReasoningInput, ReasoningOutput};
use crate::formalism::{State, Substitution};
use async_trait::async_trait;

/// The core trait for any reasoning engine or strategy.
/// This allows for different implementations of reasoning logic.
/// Supports both LLM-based and symbolic reasoning.
#[async_trait]
pub trait ReasoningStrategy: Send + Sync {
    /// The name of the strategy.
    fn name(&self) -> &str;

    /// Processes a given input and returns a reasoning output or an error.
    async fn reason(&self, input: &ReasoningInput) -> Result<ReasoningOutput, Error>;
}

/// Extended trait for strategies that can perform symbolic reasoning.
#[async_trait]
pub trait SymbolicReasoner: Send + Sync {
    /// The name of the reasoner.
    fn name(&self) -> &str;

    /// Performs symbolic reasoning on a state, potentially modifying it.
    async fn reason_symbolic(&self, state: &mut State) -> Result<(), Error>;

    /// Queries the knowledge base with a goal fact.
    async fn query(&self, state: &State, goal: &crate::formalism::Fact) -> Result<Vec<Substitution>, Error>;
}
