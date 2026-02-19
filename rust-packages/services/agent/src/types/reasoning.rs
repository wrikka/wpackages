//! types/reasoning.rs

/// Defines different reasoning strategies an agent can employ.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ReasoningStrategy {
    /// A simple, single-step execution.
    SimpleExecution,
    /// A multi-step reasoning and action loop (ReAct).
    ReAct,
    /// A hierarchical planning and execution strategy.
    HierarchicalPlanning,
}
